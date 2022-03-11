import {Inject, Service} from '@orion-js/services'
import {range} from 'lodash'
import {JobsRepo} from '../repos/JobsRepo'
import {JobDefinitionWithName, JobsDefinition} from '../types/JobsDefinition'
import {StartWorkersConfig} from '../types/StartConfig'
import {sleep} from '@orion-js/helpers'
import {Executor} from './Executor'
import {WorkersInstance} from '../types/Worker'
import {log, setLogLevel} from '../log'

@Service()
export class WorkerService {
  @Inject()
  private jobsRepo: JobsRepo
  @Inject()
  private executor: Executor

  getJobNames(jobs: JobsDefinition) {
    return Object.keys(jobs)
  }

  getJobs(jobs: JobsDefinition): JobDefinitionWithName[] {
    return Object.keys(jobs).map(name => {
      return {
        name,
        ...jobs[name]
      }
    })
  }

  async runWorkerLoop(jobs: JobsDefinition) {
    const names = this.getJobNames(jobs)
    log('debug', `Running worker loop for jobs "${names.join(', ')}"...`)
    const jobToRun = await this.jobsRepo.getJobAndLock(names)
    if (!jobToRun) {
      log('debug', 'No job to run')
      return false
    }

    log('debug', `Got job to run: ${JSON.stringify(jobToRun)}`)
    await this.executor.executeJob(jobs, jobToRun)

    return true
  }

  async startWorker(config: StartWorkersConfig, workersInstance: WorkersInstance) {
    while (true) {
      if (!workersInstance.running) {
        log('debug', 'Got signal to stop. Stopping worker...')
        return
      }

      try {
        const didRun = await this.runWorkerLoop(config.jobs)
        if (!didRun) await sleep(config.pollInterval)
        if (didRun) await sleep(config.cooldownPeriod)
      } catch (error) {
        log('error', `Error in job runner. Waiting and running again`, error)
        await sleep(config.pollInterval)
      }
    }
  }

  createWorkersInstanceDefinition(config: StartWorkersConfig): WorkersInstance {
    const workersInstance = {
      running: true,
      workersCount: config.workersCount,
      workers: [],
      stop: async () => {
        log('debug', 'Stopping workers...', workersInstance.workers)
        workersInstance.running = false
        await Promise.all(workersInstance.workers)
      }
    }

    return workersInstance
  }

  async ensureRecords(config: StartWorkersConfig) {
    const jobs = this.getJobs(config.jobs)

    await Promise.all(
      jobs
        .filter(job => job.type === 'recurrent')
        .map(async job => {
          log('debug', `Ensuring records for job "${job.name}"...`)
          await this.jobsRepo.ensureJobRecord(job)
        })
    )
  }

  async runWorkers(config: StartWorkersConfig, workersInstance: WorkersInstance) {
    log('debug', 'Will ensure records for recurrent jobs')
    await this.ensureRecords(config)
    for (const workerIndex of range(config.workersCount)) {
      log('debug', `Starting worker ${workerIndex}`)
      const workerPromise = this.startWorker(config, workersInstance)
      workersInstance.workers.push(workerPromise)
    }
  }

  startWorkers(userConfig: Partial<StartWorkersConfig>): WorkersInstance {
    const defaultConfig: StartWorkersConfig = {
      jobs: {},
      cooldownPeriod: 100,
      pollInterval: 3000,
      workersCount: 4,
      logLevel: 'info'
    }

    const config = {
      ...defaultConfig,
      ...userConfig
    }

    setLogLevel(config.logLevel)

    const workersInstance = this.createWorkersInstanceDefinition(config)
    log('debug', 'Starting workers', config)

    this.runWorkers(config, workersInstance)

    return workersInstance
  }
}
import to from 'await-to-js'
import axios, { AxiosRequestConfig } from 'axios'

import { AppVeyorApiProject } from './getAppVeyorBuildInfo.d'

const API_URI = 'https://ci.appveyor.com/api/projects/'

type Response = {
  id: number
  status: AppVeyorApiProject['build']['status']
  updatedAt: string
}

export default async function (gitPath: string): Promise<Response> {
  const config: AxiosRequestConfig = {
    headers: {
      'Content-type': 'application/json'
    }
  }

  return new Promise<Response>((resolve, reject) =>
    axios.get<AppVeyorApiProject>(`${API_URI}${gitPath}`, config)
      .then(({ data }) => {
        resolve({
          // id: data.build.buildId,
          id: data.build.buildNumber,
          status: data.build.status,
          updatedAt: data.build.updated,
        })
      })
      .catch(reject)
  )
}

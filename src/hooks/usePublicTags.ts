'use client'

import { SelectPublicTag } from '@/controllers/PublicTag.controller'
import http from '@/lib/http'
import { ApiRoutes } from '@cfg'
import { useMount, useRequest } from 'ahooks'

const STORAGE_KEY = 'public-tag-state'

export default function usePublicTags() {
  const {
    data: tags = [],
    mutate,
    run,
    runAsync,
  } = useRequest(
    async () => {
      const { data } = await http.get(ApiRoutes.Public.TAG)
      return data as SelectPublicTag[]
    },
    {
      // manual: true,
      onSuccess(tags) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ tags, time: Date.now() }))
      },
    }
  )

  useMount(() => {
    const stateStr = localStorage.getItem(STORAGE_KEY)
    try {
      const state = JSON.parse(stateStr || '')
      mutate(state.tags)
    } catch (error) {
      run()
    }
  })

  const mutateWithRun = async (...args: Parameters<typeof mutate>) => {
    mutate(...args)
    await runAsync()
  }

  return { tags, mutateWithRun, mutate, run, runAsync }
}

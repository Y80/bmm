import { Metadata, ResolvingMetadata } from 'next'

export interface RSCPageProps {
  params: Record<string, string>
  searchParams: { [key: string]: string | string[] | undefined }
}

interface GenerateMetaDataProps<Params> {
  params: Params
  searchParams: { [key: string]: string | string[] | undefined }
}

export type GenerateMetadata<Params = object> = (
  props: GenerateMetaDataProps<Params>,
  parent: ResolvingMetadata
) => Awaited<Metadata>

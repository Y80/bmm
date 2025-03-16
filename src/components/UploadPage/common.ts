/** 标签关联策略 */
export enum LinkTagStrategy {
  /** 按照目录层级，分别关联标签 */
  FOLDER_PATH = '0',
  /** 仅将最近的目录作为标签进行关联 */
  CLOSED_FOLDER = '1',
  /** 全部关联「其它」标签 */
  OTHER = '2',
}

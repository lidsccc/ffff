export interface UserListItemDetail {
  code?: string;
  iconUrl?: string;
  id: string;
  isGroup: number;
  name: string;
}

export interface StructureItemData {
  name: string;
  memberCount?: number;
  id: string;
  isDel?: number;
  parentId: string;
  parentIds?: string;
  sequence: number;
  leaderId?: string;
}

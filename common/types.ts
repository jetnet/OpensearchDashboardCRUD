export interface IEntity {
  id?: string; // Optional for creation, required for updates/reads
  name: string;
  description?: string;
  type: string;
  created_at?: string; // ISO Date string
  updated_at?: string; // ISO Date string
}

export interface IGetEntitiesResponse {
  total: number;
  data: IEntity[];
}

export interface IGetEntityResponse {
  data: IEntity;
}

export interface ICreateEntityRequest {
  name: string;
  description?: string;
  type: string;
}

export interface IUpdateEntityRequest extends Partial<ICreateEntityRequest> {}

export interface IDeleteEntityResponse {
  success: boolean;
  id: string;
}

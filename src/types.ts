export interface ResumableFile extends Resumable.ResumableFile {}

export interface IInitialConfig {
  config: Resumable.ConfigurationHash;
  slug: string;
  query: { [key: string]: any };
}

export interface IFile {
  file: ResumableFile;
  id: string;
  isError: boolean;
  isCompleted: boolean;
  isUploading: boolean;
  progress: number;
  query: { [key: string]: any };
}

export interface IResumable extends Resumable.Resumable {
  getFileId?: (file: ResumableFile) => string;
  unAssignBrowse?: (element: Element | Element[]) => void;
}

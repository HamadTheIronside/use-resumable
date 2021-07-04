import * as React from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Resumable from "resumablejs";

interface IOptions {
  config: Resumable.ConfigurationHash;
  browse: React.MutableRefObject<Element | undefined>;
  updateConfigDependency?: any[];
}

export interface ResumableFileWrapper {
  file: Resumable.ResumableFile;
  isError: boolean;
  isCompleted: boolean;
  isUploading: boolean;
  progress: number;
}

const omit = (obj: object, key: string) => 
  Object.fromEntries(
    Object.entries(obj)
      .filter(([k]) => k !==key))
  

const convertFile = (file: Resumable.ResumableFile): ResumableFileWrapper => ({
  file,
  isError: false,
  isCompleted: false,
  isUploading: false,
  progress: 0,
});

const useResumable = (options: IOptions) => {
  const [files, setFiles] = useState<{ [key: string]: ResumableFileWrapper }>({});
  const resumable = useRef<Resumable>(new Resumable({}))!;
  const { updateConfigDependency = [], browse } = options;

  const removeFile = (file: ResumableFileWrapper) => {
    file.file.cancel();
    resumable.current.removeFile(file.file);
    setFiles((old) => omit(old, file.file.uniqueIdentifier));
  };

  useLayoutEffect(() => {
    resumable.current.opts = options.config;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, updateConfigDependency);

  useEffect(() => {
    resumable.current.on("filesAdded", (addedFiles) => {
      setFiles((old) => {
        const mapped = addedFiles.map((file) => ({ [file.uniqueIdentifier]: convertFile(file) }));
        return Object.assign({}, old, ...mapped);
      });
    });

    resumable.current.on("fileProgress", (file) => {
      setFiles((old) => {
        const updatedFile = {
          ...old[file.uniqueIdentifier],
          progress: file.progress(true),
        };

        return { ...omit(old, file.uniqueIdentifier), [file.uniqueIdentifier]: updatedFile };
      });
    });

    resumable.current.on("fileError", (file) => {
      setFiles((old) => {
        const updatedFile = {
          ...old[file.uniqueIdentifier],
          isError: true,
        };

        return { ...omit(old, file.uniqueIdentifier), [file.uniqueIdentifier]: updatedFile };
      });
    });

    resumable.current.on("fileSuccess", (file) => {
      setFiles((old) => {
        const updatedFile = {
          ...old[file.uniqueIdentifier],
          isCompleted: true,
        };

        return { ...omit(old, file.uniqueIdentifier), [file.uniqueIdentifier]: updatedFile };
      });
    });
  }, []);

  useEffect(() => {
    if (browse.current) resumable.current.assignBrowse(browse.current, false);
  }, []);

  return { resumable, files, setFiles, removeFile } as const;
};

export { useResumable };

import { useCallback, useState } from "react";
import Resumable from "resumablejs";
import update from "immutability-helper";

import type { IFile, IInitialConfig, IResumable, ResumableFile } from "./types";
import { omit } from "./utils";

const useResumable = () => {
  const [resumableSet, setResumableSet] = useState<{
    [key: string]: IResumable;
  }>({});
  const [files, setFiles] = useState<{ [key: string]: IFile }>({});

  const initialResumable = useCallback((config: IInitialConfig) => {
    const resumable: IResumable = new Resumable.Resumable(config.config);

    resumable.getFileId = (file) => `${config.slug}_${file.uniqueIdentifier}`;

    setResumableSet((old) => ({ ...old, [config.slug]: resumable }));

    const convertFile = (file: ResumableFile): IFile => ({
      file,
      id: resumable.getFileId(file),
      isError: false,
      isCompleted: false,
      isUploading: false,
      progress: 0,
      query: JSON.parse(JSON.stringify(config.query)),
    });

    resumable.on("filesAdded", (addedFiles) => {
      setFiles((old) => {
        const mapped = addedFiles.map((file) => ({
          [resumable.getFileId(file)]: convertFile(file),
        }));
        return Object.assign({}, old, ...mapped);
      });
    });

    resumable.on("fileProgress", (file) => {
      setFiles((old) => {
        const fileKey = resumable.getFileId(file);
        return update(old, {
          [fileKey]: { progress: { $set: file.progress(true) } },
        });
      });
    });

    resumable.on("fileError", (file) => {
      setFiles((old) => {
        const fileKey = resumable.getFileId(file);
        return update(old, { [fileKey]: { isError: { $set: true } } });
      });
    });

    resumable.on("fileSuccess", (file) => {
      setFiles((old) => {
        const fileKey = resumable.getFileId(file);
        return update(old, { [fileKey]: { isCompleted: { $set: true } } });
      });
    });

    return resumable;
  }, []);

  const getOrInitialResumable = (config: IInitialConfig) => {
    const resumable = Object.entries(resumableSet).find(
      ([slug]) => slug === config.slug
    )?.[1];
    return resumable ?? initialResumable(config);
  };

  const removeFile = (slug: string) => {
    const file = Object.entries(files).find(
      ([fileSlug]) => fileSlug === slug
    )?.[1];
    if (!file) return;

    file.file.cancel();
    file.file.resumableObj.removeFile(file.file);
    setFiles((old) => omit(old, file.id));
  };

  return {
    files,
    setFiles,
    removeFile,
    getOrInitialResumable,
    resumableSet,
  } as const;
};

export { useResumable };

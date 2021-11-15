# useResumable Hook

Basically this hook is a Resumable JS adapter, you can use it to connect to your own resumable api to upload files.

## How to install?

    npm install --save use-resumable

## How to use it?

example:

```jsx
const ResumableContext = createContext<
  | {
      resumable: React.RefObject<Resumable.Resumable>;
      files: { [key: string]: IFile };
      removeFile: (slug: string) => void;
      browseRef: React.RefObject<HTMLElement>;
    }
  | undefined
>(undefined);

const ResumableProvider: React.FC = ({ children }) => {
  const location = useLocation();
  const {
    config: { manager },
  } = useConfig();
  const { currentFolder } = usePath();
  const queryClient = useQueryClient();
  const browseRef = useRef();

  const { removeFile, files, setFiles, getOrInitialResumable, resumableSet } = useResumable();

  const config: IInitialConfig = useMemo(
    () => ({
      config: {
        target: "your resumable url",
        forceChunkSize: true,
        simultaneousUploads: 1,
        chunkRetryInterval: 10,
        maxChunkRetries: 2,
        chunkSize: 30 * 1024 * 1024,
        generateUniqueIdentifier: (file, event, uniqueIdentifier) => md5(uniqueIdentifier),
      },
      slug: `${currentFolder.type}_${currentFolder.id}`,
      query: {
        currentFolder: cloneDeep(currentFolder),
      },
    }),
    [manager, currentFolder],
  );

  const currentResumable = useMemo(() => {
    const resumable = getOrInitialResumable(config);

    resumable.on("fileError", (file, message) => {
      const response: { message: string } = JSON.parse(message);

      setFiles((old) => {
        const key = resumable.getFileId(file);
        if (!key) return old;

        const isError = FILE_UPLOADED_FOR_THIS_PROBLEM !== response.message;

        return update(old, {
          [key]: { isError: { $set: isError }, isCompleted: { $set: !isError } },
        });
      });
    });

    resumable.on("fileSuccess", () =>
      queryClient.removeQueries(["qmediaList", config.query.currentFolder.type, config.query.currentFolder.id]),
    );

    return resumable;
  }, [config, getOrInitialResumable, queryClient, setFiles]);

  const value = useMemo(
    () => ({
      removeFile,
      files,
      resumable: { current: currentResumable },
      browseRef,
    }),
    [currentResumable, files, removeFile],
  );

  useEffect(() => {
    const ref = browseRef.current;
    const resumableList = Object.values(resumableSet);

    if (ref) {
      currentResumable.assignBrowse(ref, false);
      currentResumable.assignDrop(ref);
    }

    return () => {
      resumableList.forEach((resumable) => !!ref && resumable?.unAssignDrop(ref));
    };
  }, [resumableSet, location, currentResumable]);

  return <ResumableContext.Provider value={value}>{children}</ResumableContext.Provider>;
};

const useResumableContext = () => {
  const context = useContext(ResumableContext);
  if (context === undefined) {
    throw new Error("useResumableContext must be within ResumableProvider");
  }

  return context;
};

export { ResumableProvider, useResumableContext };
```

## Roadmap

- Adding unit tests
- Adding support for multiple resumable instances
- fixing all typescript bugs
- adding a more complete example
- adding a more complete documentation

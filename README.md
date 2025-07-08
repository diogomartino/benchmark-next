# benchmark-next

Tool that will run a Next.js project, fetch all routes and plot CPU and memory usage over time.

### Dependencies

https://github.com/astrofrog/psrecord
https://bun.sh/

### Usage

```bash
bun start -p /path/to/your/project
```

```bash
# deletes .next folder before running
bun start -p /path/to/your/project --noCache
```

```bash
# forces a specific Next.js version
bun start -p /path/to/your/project --nextVersion 15.4.0-canary.109
```

### Results

Results are saved in the `results` folder. The results consist of:

- .json file with all details of the run: resources usage, route processing times, etc.
- .png file with a plot of CPU and memory usage over time
- .txt summary of the run

// Structured server-side logger.
//
// Why not console.log/warn/error?
// vite.config.ts sets terser { drop_console: true, pure_funcs: ['console.log', ...] }
// which strips console.* calls from the production bundle — including server-side
// functions bundled by the Vercel adapter. This means rate-limit events and other
// operational logs are silently discarded in production.
//
// process.stdout.write is not a console.* function and is never touched by terser,
// guaranteeing log output reaches Vercel's function log stream in all environments.

type Level = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
    ts: string;
    level: Level;
    msg: string;
    [key: string]: unknown;
}

function write(level: Level, msg: string, meta?: Record<string, unknown>): void {
    const entry: LogEntry = {
        ts: new Date().toISOString(),
        level,
        msg,
        ...meta
    };

    const line = JSON.stringify(entry) + '\n';

    // Use stderr for warn/error so cloud providers route them to the error stream.
    const stream = (level === 'error' || level === 'warn') ? process.stderr : process.stdout;
    try {
        stream.write(line);
    } catch {
        // Last-resort fallback if stream write fails (e.g. in test environments
        // that close stdout). Deliberately not using console.* here to avoid
        // triggering terser's drop_console in non-test builds.
    }
}

export const logger = {
    debug: (msg: string, meta?: Record<string, unknown>) => write('debug', msg, meta),
    info:  (msg: string, meta?: Record<string, unknown>) => write('info',  msg, meta),
    warn:  (msg: string, meta?: Record<string, unknown>) => write('warn',  msg, meta),
    error: (msg: string, meta?: Record<string, unknown>) => write('error', msg, meta)
};

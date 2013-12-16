package net.browsertime.tool.timingrunner;

public class TimingRunnerException extends RuntimeException {
    public TimingRunnerException(String message, Throwable cause) {
        super(message, cause);
    }

    public TimingRunnerException(String message) {
        super(message);
    }
}

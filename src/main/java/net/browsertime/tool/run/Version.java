package net.browsertime.tool.run;

public class Version {
  static String getVersion() {
    String version = Version.class.getPackage().getImplementationVersion();
    return version != null ? version : "unknown";
  }
}

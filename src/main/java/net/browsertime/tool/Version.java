package net.browsertime.tool;

public class Version {
  public static String getVersion() {
    String version = Version.class.getPackage().getImplementationVersion();
    return version != null ? version : "unknown";
  }
}

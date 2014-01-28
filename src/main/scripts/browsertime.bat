@ECHO OFF

set MAINCLASS="net.browsertime.tool.run.Main"

%JAVA_HOME%\bin\java -classpath "..\lib\*" %MAINCLASS% %*
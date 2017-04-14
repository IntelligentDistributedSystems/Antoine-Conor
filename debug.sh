#!/bin/bash
# JDK has to be installed!!! : sudo apt-get install openjdk-8-jdk
# /path/to/java -classpath /path/to/ant-launcher-1.9.7.jar org.apache.tools.ant.launch.Launcher -e -f /path/to/build.xml 
java -classpath bin/libs/ant-launcher-1.9.7.jar org.apache.tools.ant.launch.Launcher -e -f bin/build.xml
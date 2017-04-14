#!/bin/bash
rm src/java/internalActions/*.class
javac -classpath ../eclipse/jason/libs/jason-2.1.jar:. src/java/internalActions/*

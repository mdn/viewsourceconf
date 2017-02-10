@Library('github.com/mozmar/jenkins-pipeline@master')

// Slightly different than the kuma version.
// If we can't find a {branch}.groovy file, we default to default.groovy.
def loadBranchConfig(String branch) {
  if (fileExists("./Jenkinsfiles/${branch}.yml")) {
    config = readYaml file: "./Jenkinsfiles/${branch}.yml"
    println "config ==> ${config}"
  } else {
    println "Loading defaults for Jenkinsfile development"
    config = readYaml file: "./Jenkinsfiles/default.yml"
    println "config ==> ${config}"
  }

  if (config && config.pipeline && config.pipeline.enabled == false) {
    println "Pipeline disabled."
  } else {
    if (config && config.pipeline && config.pipeline.script) {
      println "Loading ./Jenkinsfiles/${config.pipeline.script}.groovy"
      load "./Jenkinsfiles/${config.pipeline.script}.groovy"
    } else {
      if(fileExists("./Jenkinsfiles/${branch}.groovy")) {
          println "Loading ./Jenkinsfiles/${branch}.groovy"
          load "./Jenkinsfiles/${branch}.groovy"
        } else {
          println "Loading ./Jenkinsfiles/default.groovy"
          load "./Jenkinsfiles/default.groovy"
        }
    }
  }
}

node {
  stage("Prepare") {
    checkout scm
    setGitEnvironmentVariables()

    // When checking in a file exists in another directory start with './' or
    // prepare to fail.
    if (fileExists("./Jenkinsfiles/${env.BRANCH_NAME}.groovy") || fileExists("./Jenkinsfiles/${env.BRANCH_NAME}.yml")) {
      loadBranchConfig(env.BRANCH_NAME)
    } else {
      loadBranchConfig("default")
    }
  }
}

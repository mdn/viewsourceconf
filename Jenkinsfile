node {
  @Library('github.com/mozmar/jenkins-pipeline@master')

  stage("Prepare") {
    checkout scm
    setGitEnvironmentVariables()

    // When checking in a file exists in another directory start with './' or
    // prepare to fail.
    if (fileExists("./Jenkinsfiles/${env.BRANCH_NAME}.groovy") || fileExists("./Jenkinsfiles/${env.BRANCH_NAME}.yml")) {
      loadBranch(env.BRANCH_NAME)
    }
    else {
      loadBranch("default")
    }
  }

  stage('Build & push images') {
    sh 'make build-build-image'
    sh 'make build'
    sh 'make build-deploy-image'
    sh 'make push-registry'
  }

  stage('Deploy') {
    env.KUBECONFIG = "${env.HOME}/.kube/virginia.kubeconfig"
    env.DEIS_PROFILE = 'virginia'
    env.DEIS_BIN = 'deis2'
    env.DEIS_APP = 'viewsourceconf-stage'

    sh 'make workflow-create'
    sh 'make workflow-pull'
    sh 'make workflow-scale-worker'
  }
}
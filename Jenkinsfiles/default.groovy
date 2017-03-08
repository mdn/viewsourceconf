stage('Build and push') {
    env.DEIS_APP = config.deis.app
    env.DEIS_BIN = config.deis.bin
    println "Deis app = ${config.deis.app}"
    println "Deis bin = ${config.deis.bin}"
    sh 'make workflow-build-and-push'
}

stage('Deploy to Virginia Workflow') {
    env.KUBECONFIG = config.deis.virginia.kubeconfig
    env.DEIS_PROFILE = config.deis.virginia.profile
    println "Deis profile = ${env.KUBECONFIG}"
    println "kubeconfig = ${env.DEIS_PROFILE}"
    sh 'make workflow-create-and-pull'
}

stage('Deploy to Tokyo Workflow') {
    env.KUBECONFIG = config.deis.tokyo.kubeconfig
    env.DEIS_PROFILE = config.deis.tokyo.profile
    println "Deis profile = ${env.KUBECONFIG}"
    println "kubeconfig = ${env.DEIS_PROFILE}"
    sh 'make workflow-create-and-pull'
}

stage('Build and push') {
    env.KUBECONFIG = config.kubernetes.kubeconfig
    env.DEIS_PROFILE = config.deis.profile
    env.DEIS_BIN = config.deis.bin
    env.DEIS_APP = config.deis.app

    println "Deis profile = ${config.deis.profile}"
    println "Deis Workflow app = ${config.deis.app}"
    println "Deis bin = ${config.deis.bin}"
    println "kubeconfig = ${config.kubernetes.kubeconfig}"
    sh 'make workflow-build-and-push'
}

stage('Deploy to Workflow') {
    // env is already set from "Build and push" stage above
    sh 'make workflow-create-and-pull'
}

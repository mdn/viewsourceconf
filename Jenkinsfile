#!groovy

def buildSite() {
    stage ('build') {
      try {
        //TODO: fix command below, currently returning exit code 2
        //sh 'make build-image'
        //TODO: enable command below once fix above applied
        //sh 'make push-build-image'
        sh 'make build'
      } catch(err) {
          sh "bin/irc-notify.sh --stage 'build " + env.BRANCH_NAME + "' --status 'failed'"
        throw err
      }
    }
}

def syncS3(String bucket) {
    stage ('s3 sync') {
        try {
          sh "cd build && aws s3 sync . s3://" + bucket +" --acl public-read --delete --profile viewsourceconf --exclude 'docs/*'"
        } catch(err) {
          sh "bin/irc-notify.sh --stage 's3 sync " + env.BRANCH_NAME + "' --status 'failed'"
          throw err
        }
        sh "bin/irc-notify.sh --stage 's3 sync " + env.BRANCH_NAME + "' --status 'shipped'"
    }
}

node {
    stage ('Prepare') {
      checkout scm
    }
    if ( env.BRANCH_NAME == 'master' ) {
      buildSite()
      syncS3('viewsourceconf-stage')
    } else if ( env.BRANCH_NAME == 'prod' ) {
      buildSite()
      syncS3('viewsourceconf')
    }
}

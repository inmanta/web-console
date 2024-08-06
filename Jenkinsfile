pipeline {
    agent none

    options{
        disableConcurrentBuilds()
        checkoutToSubdirectory('web-console')
        skipDefaultCheckout()
        ansiColor('xterm')
    }
    triggers{
        pollSCM('* * * * *')
        cron(BRANCH_NAME ==~ /master|iso[0-9]+/ ? "H H(2-5) * * *" : "")
    }
    environment {
        GITLAB_TOKEN = credentials('jenkins_on_gitlab')
        CLOUDSMITH_TOKEN = credentials('cloudsmith-token')
    }

    stages {
        stage('Determine whether job should run') {
            agent any
            when {
                beforeAgent true
                anyOf {
                    triggeredBy 'UserIdCause'
                    // skip builds for next and stable branches unless triggered manually
                    not {
                        branch pattern: 'iso\\d+-(next|stable)', comparator: 'REGEXP'
                    }
                }
            }
            stages {
                stage('Build & Unit Test') {
                    steps {
                        deleteDir()
                        dir('web-console'){
                            checkout scm
                            sh '''
                            yarn install --immutable;
                            yarn lint;
                            yarn format:check;
                            yarn tsc;
                            yarn check-circular-deps;
                            yarn build;
                            yarn test:ci'''
                        }
                    }
                }
            }
            post {
                always {
                    cobertura coberturaReportFile: 'web-console/coverage/cobertura-coverage.xml', failNoReports: false, failUnhealthy: false
                    deleteDir()
                }
            }
        }
    }

}

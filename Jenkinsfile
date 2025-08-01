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
                            node --max-old-space-size=6144 ./node_modules/.bin/vite build;
                            yarn test:ci'''
                        }
                    }
                }
                stage('Testing with cypress') {
                    steps {
                        timeout(time: 20, unit: 'MINUTES') {
                            dir('web-console') {
                                sh '''node --max-old-space-size=6144 ./node_modules/.bin/vite build;
                                sudo systemctl restart docker && sudo docker network prune -f;
                                yarn run install:orchestrator:ci;
                                yarn run cypress-test:iso;'''
                            }
                        }
                    }
                    post {
                        always {
                            dir('web-console') {
                                sh'yarn run kill-server'
                            }
                        }
                    }
                }
            }
            post {
                always {
                    junit 'web-console/cypress/reports/junit/*.xml'
                    cobertura coberturaReportFile: 'web-console/coverage/cobertura-coverage.xml', failNoReports: false, failUnhealthy: false
                    archiveArtifacts artifacts: 'web-console/cypress/reports/cypress-report.xml, web-console/cypress/screenshots/**, web-console/cypress/videos/**, coverage/**, test-results.txt', allowEmptyArchive: true, onlyIfSuccessful: false
                    deleteDir()
                }
            }
        }
    }

}

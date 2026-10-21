// Coverage is only recorded for master and iso branches, other branch builds skip it.
def vitestCoverageArgs = env.BRANCH_NAME ==~ /master|iso[0-9]+/ ? '' : '--coverage.enabled=false'

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
        JOINTJS_NPM_TOKEN = credentials('jointjs-npm-token')
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
                            sh """
                            yarn install --immutable;
                            yarn lint;
                            yarn format:check;
                            yarn tsc;
                            yarn check-circular-deps;
                            yarn build:ci;
                            yarn check-no-cdn;
                            yarn test:ci ${vitestCoverageArgs}"""
                        }
                    }
                }
                stage('Testing with cypress') {
                    steps {
                        timeout(time: 20, unit: 'MINUTES') {
                            dir('web-console') {
                                sh '''yarn build:ci;
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
                    script {
                        if (fileExists('web-console/coverage/cobertura-coverage.xml')) {
                            recordCoverage(tools: [[parser: 'COBERTURA', pattern: 'web-console/coverage/cobertura-coverage.xml']], sourceCodeRetention: 'NEVER')
                        }
                    }
                    archiveArtifacts artifacts: 'web-console/cypress/reports/cypress-report.xml, web-console/cypress/screenshots/**, web-console/cypress/videos/**, web-console/coverage/**, test-results.txt', allowEmptyArchive: true, onlyIfSuccessful: false
                }
                cleanup {
                    deleteDir()
                }
            }
        }
    }

}

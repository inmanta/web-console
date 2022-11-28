pipeline {
    agent any

    options{
        disableConcurrentBuilds()
        checkoutToSubdirectory('web-console')
        skipDefaultCheckout()
        timeout(time: 15, unit: 'MINUTES')
    }
    triggers{
        pollSCM('* * * * *')
        cron(BRANCH_NAME ==~ /master|iso[0-9]+/ ? "H H(2-5) * * *" : "")
    }
    environment {
        GITLAB_TOKEN = credentials('jenkins_on_gitlab')
    }

    stages {
        stage('Build & Unit Test') {
            steps {
                deleteDir()
                dir('web-console'){
                    checkout scm
                    sh '''yarn install --frozen-lockfile;
                    yarn lint;
                    yarn format:check;
                    yarn tsc;
                    yarn check-circular-deps;
                    yarn build;
                    yarn test:ci'''
                }
            }
        }
        stage('Testing with cypress') {
            steps {
                dir('web-console') {
                    sh '''yarn run build;
                    yarn run setup-server:lsm;
                    yarn run cypress-test;
                    yarn run kill-server:lsm'''
                }
            }
        }
    }

    post {
        always {
            dir('web-console') {
                    sh '''npx junit-merge -d cypress/reports/junit -o cypress/reports/cypress-report.xml'''
            }
            junit 'web-console/junit.xml'
            cobertura coberturaReportFile: 'web-console/coverage/cobertura-coverage.xml', failNoReports: false, failUnhealthy: false
            archiveArtifacts artifacts: 'web-console/cypress/reports/cypress-report.xml, web-console/cypress/screenshots/**', allowEmptyArchive: true, onlyIfSuccessful: false
            deleteDir()
        }
    }
}

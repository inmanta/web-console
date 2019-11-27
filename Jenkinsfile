pipeline {
    agent any

    options{
        disableConcurrentBuilds()
        checkoutToSubdirectory('web-console')
    }
    triggers{
        pollSCM('* * * * *')
        cron("H H(2-5) * * *")
    }

    stages {
        stage('Build & Unit Test') {
            steps {
                dir('web-console'){
                    sh '''yarn;
                    yarn lint;
                    yarn build;
                    yarn test'''
                }
            }
        }
        stage('Testing with cypress') {
            steps {
                dir('web-console') {
                    sh '''yarn cypress-test;
                    npx junit-merge -d cypress/reports/junit -o cypress/reports/cypress-report.xml'''
                }
            }
        }
    }

    post {
        always {
            junit 'web-console/junit.xml'
            cobertura coberturaReportFile: 'web-console/coverage/cobertura-coverage.xml', failNoReports: false, failUnhealthy: false
            junit 'web-console/cypress/reports/cypress-report.xml'
            archiveArtifacts artifacts: 'web-console/cypress/screenshots/*', allowEmptyArchive: true, onlyIfSuccessful: false
        }
    }
}
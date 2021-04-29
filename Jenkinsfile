pipeline {
    agent any

    options{
        disableConcurrentBuilds()
        checkoutToSubdirectory('web-console')
        skipDefaultCheckout()
    }
    triggers{
        pollSCM('* * * * *')
        cron(BRANCH_NAME ==~ /master|iso[0-9]+/ ? "H H(2-5) * * *" : "")
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
            archiveArtifacts artifacts: 'web-console/cypress/reports/cypress-report.xml, web-console/cypress/screenshots/*', allowEmptyArchive: true, onlyIfSuccessful: false
            deleteDir()
        }
    }
}

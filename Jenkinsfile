pipeline {
    agent any

    parameters {
        booleanParam(name: 'publish_package', defaultValue: false, description: 'Should the package be published to the github npm registry')
        string(name: 'version', defaultValue: '0.0.1', description: 'Version number for the package')
    }

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
        stage('Publish') {
            when {
                expression {return params.publish_package}
            }
            steps {
                dir('web-console') {
                    sh '''yarn publish --new-version ${params.version}'''
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
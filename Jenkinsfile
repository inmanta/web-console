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
                dir('web-console'){
                    sh '''yarn delete:reports;
                    yarn start-test 'yarn start' http-get://localhost:9000 'docker run --net="host" -i -v $PWD:/e2e -w /e2e  cypress/included:3.4.0;'
                    npx mochawesome-merge --reportDir cypress/reports/mochawesome > cypress/reports/mochawesome.json;
                    npx mochawesome-report-generator --reportDir cypress/reports/ --charts true cypress/reports/mochawesome.json'''
                }
            }
        }
    }

    post {
        always {
            junit 'web-console/junit.xml'
            cobertura coberturaReportFile: 'web-console/coverage/cobertura-coverage.xml', failNoReports: false, failUnhealthy: false
            publishHTML (target: [
            allowMissing: true,
            alwaysLinkToLastBuild: false,
            keepAll: true,
            reportDir: 'web-console/cypress/reports/mochawesome',
            reportFiles: 'mochawesome.html',
            reportName: "Mochawesome Tests Report"
            ])
        }
    }
}
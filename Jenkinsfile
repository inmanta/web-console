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
        stage('Write') {
            steps {
                script {
                    dir('web-console') {
                        checkout scm
                        GIT_COMMIT_HASH = sh (script: "git log -n 1 --pretty=format:'%H'", returnStdout: true)
                        println('Commit Hash being added: ' + GIT_COMMIT_HASH)
                        def fileContent = '{"version_hash": ' + '"' + GIT_COMMIT_HASH + '"}'
                        writeFile('version.json', text: fileContent)
                        println('File with versioning has been added.')

                    }
                }
            }
        }
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
                    yarn test'''
                }
            }
        }
        stage('Testing with cypress') {
            steps {
                dir('web-console') {
                    sh '''yarn cypress-test'''
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

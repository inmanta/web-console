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
        stage('Test') {
            steps {
                dir('web-console'){
                    sh '''yarn;
                    yarn lint;
                    yarn build;
                    yarn test'''
                }
            }
        }
    }

    post {
        always {
            junit 'web-console/junit.xml'
        }
    }
}
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
                stage('Checkout') {
                    steps {
                        deleteDir()
                        dir('web-console'){
                            script {
                                def scmVars = checkout scm
                                env.CHANGELOG_ONLY = isChangelogOnly(scmVars.GIT_PREVIOUS_SUCCESSFUL_COMMIT).toString()
                                if (env.CHANGELOG_ONLY == 'true') {
                                    echo 'Only change entries changed since the last successful build, skipping the tests.'
                                }
                            }
                        }
                    }
                }
                stage('Validate change entries') {
                    steps {
                        dir('web-console'){
                            sh '''
                            /opt/irt/bin/python3 -c '
import os
from irt.changelog import CHANGE_ENTRIES_PATH, parse_change_entry
for name in os.listdir(CHANGE_ENTRIES_PATH):
    if name != ".gitkeep":
        parse_change_entry(os.path.join(CHANGE_ENTRIES_PATH, name))
'
                            '''
                        }
                    }
                }
                stage('Build & Unit Test') {
                    steps {
                        script {
                            if (env.CHANGELOG_ONLY == 'true') {
                                echo 'Skipped: only change entries changed since the last successful build.'
                                return
                            }
                            dir('web-console'){
                                sh '''
                                yarn install --immutable;
                                yarn lint;
                                yarn format:check;
                                yarn tsc;
                                yarn check-circular-deps;
                                yarn build:ci;
                                yarn check-no-cdn;
                                yarn test:ci'''
                            }
                        }
                    }
                }
                stage('Testing with cypress') {
                    steps {
                        script {
                            if (env.CHANGELOG_ONLY == 'true') {
                                echo 'Skipped: only change entries changed since the last successful build.'
                                return
                            }
                            timeout(time: 20, unit: 'MINUTES') {
                                dir('web-console') {
                                    sh '''yarn build:ci;
                                    sudo systemctl restart docker && sudo docker network prune -f;
                                    yarn run install:orchestrator:ci;
                                    yarn run cypress-test:iso;'''
                                }
                            }
                        }
                    }
                    post {
                        always {
                            script {
                                if (env.CHANGELOG_ONLY != 'true') {
                                    dir('web-console') {
                                        sh'yarn run kill-server'
                                    }
                                }
                            }
                        }
                    }
                }
            }
            post {
                always {
                    script {
                        if (env.CHANGELOG_ONLY != 'true') {
                            junit 'web-console/cypress/reports/junit/*.xml'
                            if (fileExists('web-console/coverage/cobertura-coverage.xml')) {
                                recordCoverage(tools: [[parser: 'COBERTURA', pattern: 'web-console/coverage/cobertura-coverage.xml']], sourceCodeRetention: 'NEVER')
                            } else {
                                // Marks the build unstable, unless an earlier stage already failed it.
                                unstable('No unit test coverage report at web-console/coverage/cobertura-coverage.xml')
                            }
                            archiveArtifacts artifacts: 'web-console/cypress/reports/cypress-report.xml, web-console/cypress/screenshots/**, web-console/cypress/videos/**, web-console/coverage/**, test-results.txt', allowEmptyArchive: true, onlyIfSuccessful: false
                        }
                    }
                }
                cleanup {
                    deleteDir()
                }
            }
        }
    }

}

/**
 * True iff every change since the last successful build of this branch is an added or modified change entry.
 * Release branches and rewritten history always get a full build.
 */
def isChangelogOnly(String previousSuccessfulCommit) {
    if (previousSuccessfulCommit == null || env.BRANCH_NAME ==~ /master|iso[0-9]+(-(next|stable))?/) {
        return false
    }
    if (sh(returnStatus: true, script: "git merge-base --is-ancestor ${previousSuccessfulCommit} HEAD") != 0) {
        return false
    }
    def changes = sh(returnStdout: true, script: "git diff --name-status --no-renames ${previousSuccessfulCommit} HEAD").trim()
    return changes && changes.readLines().every { it ==~ /[AM]\tchangelogs\/unreleased\/[^\/]+\.yml/ }
}

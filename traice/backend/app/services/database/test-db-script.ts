import { exec } from 'child_process';

export async function setUpTestDb(): Promise<void> {
    const dockerImage = 'test_database';
    const dockerContainer = 'test_database';
    await executeShellCommand(`docker build -t ${dockerContainer} -f ../database/Dockerfile.test ../database`);
    await executeShellCommand(`docker run -d -p 8002:5432 --name ${dockerContainer} ${dockerImage}`);
}

function executeShellCommand(command: string): Promise<void> {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            } else {
                console.log(stdout);
                console.error(stderr);
                resolve();
            }
        });
    });
}

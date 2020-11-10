const axios = require('axios');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Enter city ', async(answer) => {
    // TODO: Log the answer in a database
    try {
        let {data} = await axios.get('http://api.openweathermap.org/data/2.5/weather', {
            params: {
                q: answer,
                appid: 'ff0b740ef54b37cb4b88cadacb59d187',
                units: 'metric'
            }
        });
        let key = data.main;
        let temp = key.temp;
        if (temp > 20) {
            console.log('\x1b[31m',`City temperature ${temp}`);
        } else if (temp > 10){
            console.log('\x1b[33m',`City temperature ${temp}`);
        } else {
            console.log('\x1b[34m',`City temperature ${temp}`);
        }
    } catch (e) {
        console.log('\x1b[31m', `Enter the correct city`);
    }
    rl.close();
});

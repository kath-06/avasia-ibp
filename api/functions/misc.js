module.exports = {
    uniqID: () => {
        let today = new Date();
        let date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
        let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        let uniqID = today.getFullYear() + "" + (today.getMonth() + 1) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);
        return uniqID;
    } ,

    dateToday: () => {
        let today = new Date();
        let date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
        let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        let dateToday = date + ' ' + time;
        return dateToday;
    } ,

    generateRandomString: () => {
        return Math.random().toString(36).substring(2, 15).toUpperCase() + Math.random().toString(36).substring(2, 15).toUpperCase();
    } ,
}
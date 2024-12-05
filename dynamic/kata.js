var _kata_port;
const getKataPort = () => {
    _kata_port = localStorage.getItem('kata_port');
}

function getKataData(id,callback) {
    if (_kata_port == undefined && _kata_port == null) {
        getKataPort();
    }
    console.log(_kata_port);
    if (_kata_port == undefined || _kata_port == null || _kata_port == "") {
        return;
    }
    axios.get("http://localhost:" + _kata_port + "/data")
        .then((res) => {
            const data=parseFLoat(res.data)||0;
            if(data>0){
                $('#' + id).val(parseFloat(res.data));
                if (callback) {
                    callback(parseFloat(res.data));
                }
            }
        })
        .catch((err) => {

        });
}

function getFatSnfData(fat_id, snf_id,callback) {
    if (_kata_port == undefined && _kata_port == null) {
        getKataPort();
    }
    if (_kata_port == undefined || _kata_port == null || _kata_port == "") {
        return;
    }
    axios.get("http://localhost:" + _kata_port + "/fat-snf")
        .then((res) => {
            const [fat, snf] = res.data.split("|").map(Number);
            console.log(fat, snf);
            
            if (fat > 0) {
                $('#' + fat_id).val(fat);
            }
            if (snf > 0) {
                $('#' + snf_id).val(snf);
            }
            if (callback) {
                callback(fat, snf);
            }
        })
        .catch((err) => {
            console.log(err);
            
        });
}

function onlinePrint(data) {
    if (_kata_port == undefined && _kata_port == null) {
        getKataPort();
    }
    if (_kata_port == undefined || _kata_port == null || _kata_port == "") {
        return;
    }
    axios.post("http://localhost:" + _kata_port + "/online-print", data)
        .then((res) => {

        })
        .catch((err) => {

        });
}

function kataPrint(data) {
    if (_kata_port == undefined && _kata_port == null) {
        getKataPort();
    }
    if (_kata_port == undefined || _kata_port == null || _kata_port == "") {
        return;
    }
    axios.post("http://localhost:" + _kata_port + "/dailyprint", data)
        .then((res) => {

        })
        .catch((err) => {

        });
}

function printBill(url) {
    showProgress('Printing Bill');
    lock = true;
    if (!_kata_port) {
        getKataPort();
    }

    if (!_kata_port || _kata_port === "") {
        window.open(url + '?column_count=' + paperColumnCount);
        lock = false;
        return;
    }
    axios.get(url + "?json=1")
        .then((res) => {
            console.log(res.data);


            return axios.post("http://localhost:" + _kata_port + "/bill", res.data);
        })
        .then((res) => {
            // Additional logic for successful local bill printing can go here
        })
        .catch((err) => {
            window.open(url + '?column_count=' + paperColumnCount);
            errAlert(err);
        })
        .finally(() => {
            lock = false;
            hideProgress();
        });
}

var win = {
    id: "#window",
    shown: false,
    show: (title, text) => {
        $('#wt').html(title);
        $('#wc').html(text);
        $(win.id).addClass('shown');
        win.shown = true;
        console.log(win);
    },
    showGet: (title, URL, callback) => {
        $('#wt').html(title);
        axios.get(URL)
            .then((res) => {
                $('#wc').html(res.data);
                $(win.id).addClass('shown');
                win.shown = true;
                if (callback != undefined) {
                    callback();
                }
            });

        console.log(win);
    },
    showPost: (title, URL, data, callback) => {
        $('#wt').html(title);
        axios.post(URL, data)
            .then((res) => {
                $('#wc').html(res.data);
                $(win.id).addClass('shown');
                win.shown = true;
                if (callback != undefined) {
                    callback();
                }
            });

        console.log(win);
    },
    hide: () => {
        $('#wc').html("");
        $(win.id).removeClass('shown');
        win.shown = false;
        console.log(win);
    }
};
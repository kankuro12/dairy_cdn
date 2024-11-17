const xpayCustomData = [];
var xpayHandle;
var expayHandle;
var xpayLoad = false;

function xpayMethodChange(ele) {
    if (ele.value == 2) {
        $('#xpay_bank_holder').show();
        $('#xpay_custom_holder').hide();
    } else if (ele.value == 3) {
        $('#xpay_bank_holder').hide();
        $('#xpay_custom_holder').show();
    } else {
        $('#xpay_bank_holder').hide();
        $('#xpay_custom_holder').hide();
    }
}

function addXpayData() {

}

function xpayCustomBank(ele, id) {
    const amount = parseFloat(ele.value);

    if (isNaN(amount) || amount == 0) {
        if (exists('#xpay_custom_bank_' + id)) {
            $('#xpay_custom_bank_amount_' + id).remove();
            $('#xpay_custom_bank_' + id).remove();
        }
    } else {
        if (!exists('#xpay_custom_bank_' + id)) {
            const ele = `<input type="hidden" class="xpay_custom_bank" name="xpay_custom_bank[]" id="xpay_custom_bank_${id}" value="${id}">
                <input type="hidden" class="xpay_custom_bank_amount" name="xpay_custom_bank_amount_${id}" id="xpay_custom_bank_amount_${id}" value="${id}" value="${amount}">
                 `;
            $('#xpay_custom_banks_holder').append(ele);
        } else {
            $('#xpay_custom_bank_amount_' + id).val(amount).change();
        }
    }
}


function resetXPayment() {
    $('#xpay_amount').val(0);
    $('.xpay_custom_input').val('').change();
    $('#xpay_custom_banks_holder').html('');
    $('#xpay_method').val(1).change();
    // xpayMethodChange( $('#xpay_method')[0]);
}

function xpayHandleChange() {
    // console.log(xpayHandle.value);
    $('#xpay_amount').val(xpayHandle.value);

}

function expayHandleChange() {
    // console.log(expayHandle.value);
    $('#expay_amount').val(expayHandle.value);
    if ($('.expay_ledger_amount').length == 1) {
        $('.expay_ledger_amount').val(expayHandle.value);
    }
}

function addEXPayHandle() {
    if (exists('.expay_handle')) {
        // console.log('epayhadle loaded');
        expayHandle = $('.expay_handle')[0];
        $('#expay_amount').val(expayHandle.value);

        expayHandle.addEventListener('change', expayHandleChange, true);
        expayHandle.addEventListener('input', expayHandleChange, true);
    }
}

function addXPayHandle() {
    if (exists('#xpay')) {
        // console.log('xpay loaded');
        if (exists('.xpay_handle')) {
            // console.log('xpay handle loaded');

            xpayHandle = $('.xpay_handle')[0];
            $('#xpay_amount').val(xpayHandle.value);
            xpayHandle.addEventListener('change', xpayHandleChange, true);
            xpayHandle.addEventListener('input', xpayHandleChange, true);
        }

    }

    if (exists('.expay_handle')) {
        expayHandle = $('.expay_handle')[0];
        $('#expay_amount').val(expayHandle.value);
        expayHandle.addEventListener('change', expayHandleChange, true);
        expayHandle.addEventListener('input', expayHandleChange, true);
    }
}

function xpayVerifyData() {
    if (exists('#xpay')) {
        const method = $('#xpay_method').val();
        const amount = $('#xpay_amount').val();
        let totalamt = 0;
        const cashamt = parseFloat($('#xpay_custom_cash').val());
        if (!isNaN(cashamt)) {
            totalamt += cashamt;
        }

        if (method == 3) {
            $('.xpay_custom_bank_amount').each(function (index, element) {
                const localamt = parseFloat(element.value);
                if (!isNaN(localamt)) {
                    totalamt += localamt;
                }
            });
            if (amount == totalamt) {
                return true;
            } else {
                alert('Amount not matching');
                return false;
            }
        }

        return true;

    } else {
        return true;
    }
}

function expayVerifyData() {
    if (exists('#expay_method')) {
        const amount = $('#expay_amount').val();
        let totalamt = 0;
        const cashamt = parseFloat($('#expay_custom_cash').val());
        $('.expay_ledger_amount').each(function (index, element) {
            const localamt = parseFloat(element.value);
            if (!isNaN(localamt)) {
                totalamt += localamt;
            }
        });

        if (amount == totalamt) {
            return true;
        } else {
            alert('Amount not matching');
            return false;
        }


    } else {
        return true;
    }
}

function loadXPay(data) {
    if (exists('#xpay_amount')) {

        data.xpay_amount = $('#xpay_amount').val();
        data.xpay_method = $('#xpay_method').val();
        data.xpay = $('#xpay').val();
        data.xpay_bank = $('#xpay_bank').val();
        if (data.xpay_method == 3) {
            data.xpay_custom_bank = [];
            $('.xpay_custom_bank').each(function (index, element) {
                const bank_id = $(element).val();
                data.xpay_custom_bank.push(bank_id);
                data['xpay_custom_bank_amount_' + bank_id] = $('#xpay_custom_bank_amount_' + bank_id).val();
                data.xpay_custom_cash = $('#xpay_custom_cash').val();
            });
        }
    }
    return data;
}

function loadEXPay(data) {
    data.xpay_ledger_ids = [];
    $('input[name="xpay_ledger_ids[]"]').each(function (index, element) {
        const id = parseInt(element.value) || -1;
        if (id != -1) {
            data.xpay_ledger_ids.push(id);
            const amount = parseFloat($('#xpay_ledger_' + id).val()) || 0;
            data['xpay_ledger_' + id] = amount;
        }
    });
    return data;
}


function loadXPayEdit(id, identifire) {
    $('#expay_edit').html("No Payment Info");
    let url = xpayEditURL.replace('xxx_id', id);
    url = url.replace('xxx_identifire', identifire);
    axios.get(url)
        .then((res) => {
            $('#expay_edit').html(res.data);
        })
        .catch((err) => {

        });
}
window.addEventListener('load', addXPayHandle, true);

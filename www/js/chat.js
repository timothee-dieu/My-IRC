/*jshint multistr: true */

var joinedChannels = [];
var selectedChannel = 0;
var login = null;

$(function()
{
    $(".tab").click(onTabClick);
});

function initialize(tabId, chanName, nickname)
{
    if (!login) {
        login = nickname;
    }
    console.log('initialize id:' + tabId + 'chanName:' + chanName + ' nickname: ' + login);

    var socket = io.connect('http://timothee-dieu.com:8080', {query: 'chanName=' + chanName + '&nickname=' + login});
    var input = $('.chat_input').eq(tabId);
    var send = $('.chat_send').eq(tabId);
    var content = $('.chat_content').eq(tabId);
    var create = $('.add-channel').eq(0);
    var createInput = $('.channel-input').eq(0);

    console.log($('.chat_send'));

    socket.on('message', function (packet) 
    {
        var backup = content.html();

        if (packet.author) {
            backup += packet.author + ': ';
        }
        backup += packet.message + '<br>';

        content.html(backup);
        content.scrollTop(content[0].scrollHeight);
    });

    socket.on('alert', function (msg)
    {
        Materialize.toast(msg, 6000);
    });

    socket.on('join', function(channel)
    {
        joinChannel(channel, login);
    });

    socket.on('mp', function (data)
    {
        var backup = content.html();
        backup += data + '<br>';

        content.html(backup);
        content.scrollTop(content[0].scrollHeight);
    });

    socket.on('part', function(channel)
    {
        console.log('part channel: ' + channel);
        if (channel === chanName) {
            socket.disconnect();
            partChannel(channel);
            return;
        }
        tabId = getChannelId(chanName);
        input = $('.chat_input').eq(tabId);
        send = $('.chat_send').eq(tabId);
        content = $('.chat_content').eq(tabId);

        if (chanName !== 'General') {
            $('.tab_container').eq(tabId).attr('id', 'tab_' + tabId);
            $('.tab').eq(tabId).find('a').attr('href', '#tab_' + tabId);

        }
    });

    socket.on('updateUserList', function (users)
    {
        var userList = $('.list_container').eq(tabId).find('.collection');
        userList.html("<li class='collection-header deep-purple lighten-2 white-text center'><h6>Utilisateurs</h6 ></li>");
        

        for (var i = 0; i < users.length; i++) {
            userList.append("<li class='collection-item'>" + users[i] + "</li>");
            userList.children().last().click(onUserListClick);
        }
    });

    socket.on('createSuccess', function (name)
    {
        joinChannel(name, login);
    });

    send.click(sendMessage);
    input.keypress(onKeypress);
    create.click(createChannel);

    function createChannel()
    {
        var name = createInput.val();

        if (name === '') {
            return;
        }

        console.log('createChannel');
        
        socket.emit('createChannel', name);

        createInput.val('');
    }

    function onKeypress(e)
    {
        if (e.which === 13) {
            e.preventDefault();
            sendMessage();
        }
    }

    function onUserListClick()
    {
        var userName = $(this).html();
        input.focus();
        input.val('/msg ' + userName + ' ');

    }

    function sendMessage()
    {
        var text = input.val();

        text = text.replace(/(<([^>]+)>)/ig, "");

        if (text.length < 2) {
            input.val('');
            return;
        }
        socket.emit('send', 
        {  
            author: login,
            message: text 
        });
        input.val('');
        input.focus();
        console.log('send id:' + tabId + ' nickname: ' + login);
    }
}


function joinChannel(chanName, nickname)
{
    if (!addChannel(chanName) || chanName === 'General') {
        return Materialize.toast('<span class="red-text"> Vous avez déjà rejoint ce salon!</span>', 4000); 
    }
    generateChat(chanName);

    var id = joinedChannels.length;
    selectTab(id);
    initialize(id, chanName, nickname);
}

function partChannel(chanName)
{
    console.log('partChannel {');
    var index = joinedChannels.indexOf(chanName) + 1;
    
    if (index === -1) {
        return Materialize.toast('<span class="red-text">Vous n\'avez jamais rejoint ce channel!</span>', 4000);
    }
    removeChannel(chanName);

    if (index === selectedChannel) {
        selectTab(0);
    }

    $('.tab_container').eq(index).remove();
    $('.tab').eq(index).remove();

    console.log(joinedChannels);

    console.log('}');
}

function addChannel(chanName)
{
    var index = joinedChannels.indexOf(chanName);
    if (index !== -1) {
        return false;
    }
    joinedChannels.push(chanName);
    return true;
}

function getChannelId(chanName)
{
    return joinedChannels.indexOf(chanName) + 1;
}

function removeChannel(chanName)
{
    var index = joinedChannels.indexOf(chanName);
    if (index === -1) {
        return;
    }
    joinedChannels.splice(index, 1);
}

function onTabClick()
{
    selectedChannel = $(this).index('.tab');
}

function selectTab(id)
{
    console.log('select id: ' + id);
    if (id === 0) {
        $('a[href="#tab_general"]').trigger('click');
        return;
    }
    $('a[href="#tab_' + id + '"]').trigger('click');
    selectedChannel = id;
}






function generateChat(chanName)
{
    var id = joinedChannels.length;
    var html = 

    "<div id='tab_" + id + "' class='tab_container row'>\
        <!-- Liste des salons + utilisateurs -->\
        <div class='list_container section col s2 deep-purple lighten-4'>\
            <ul class='collection with-header'>\
                <li class='collection-header deep-purple lighten-2 white-text center'><h6>Utilisateurs</h6 ></li>\
              </ul>\
        </div>\
        <!-- Chat -->\
        <div class='chat_container col s10'>\
            <div class='chat_content'></div>\
            <div class='chat_send_container row'>\
              <div class='input-field col s10'>\
                <textarea class='chat_input materialize-textarea' length='120' maxlength='120'></textarea>\
                <label>Votre message à envoyer...</label>\
              </div>\
              <div class='input-field col s2'>\
                <button class='chat_send waves-effect waves-light btn yellow darken-4'>\
                    <i class='material-icons'>message</i>\
                </button>\
              </div>\
            </div>\
        </div>\
        <!-- Fin Chat  -->\
    </div>";
    
    $('.tabs').append('<li class="tab"><a href="#tab_'+ id +'"><span class="orange-text text-lighten-2">#</span>'+ chanName +'</a></li>')
    .children().last().click(onTabClick);
    $('.tab_container').last().after(html);


}


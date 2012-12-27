/**
 * Autojoin extension.
 */
wsc.defaults.Extension.Autojoin = function( client ) {

    var settings = client.autojoin
    
    var init = function(  ) {
    
        client.bind('cmd.autojoin', cmd_autojoin);
        client.ui.on('settings.open', settings.page);
    
    };
    
    settings.page = function( event, ui ) {
    
        var page = event.settings.page('Autojoin', true);
        var ul = '<ul>';
        var orig = {};
        orig.ajon = client.autojoin.on;
        
        if( client.autojoin.channel.length == 0 ) {
            ul+= '<li><i>No autojoin channels set</i></li></ul>';
        } else {
            for( var i in client.autojoin.channel ) {
                if( !client.autojoin.channel.hasOwnProperty( i ) )
                    continue;
                ul+= '<li>' + client.autojoin.channel[i] + '</li>';
            }
            ul+= '</ul>';
        }
        
        page.item('Checkbox', {
            'ref': 'eaj',
            'title': 'Autojoin',
            'text': 'Turn on autojoin to automatically join selected channels\
                    when you connect to the chat server.',
            'items': [
                { 'value': 'yes', 'title': 'On', 'selected': orig.ajon }
            ],
            'event': {
                'change': function( event ) {
                    console.log(event, settings);
                    if( event.target.value == 'yes' )
                        client.autojoin.on = event.target.checked;
                },
                'save': function( event ) {
                    console.log(client.autojoin);
                    orig.ajon = client.autojoin.on;
                    client.config_save();
                },
                'close': function( event ) {
                    client.autojoin.on = orig.ajon;
                }
            }
        });
        
        var uf = page.item('Form', {
            'ref': 'autojoin',
            'wclass': 'boxed-ff-indv',
            'title': 'Autojoin',
            'text': 'Add any channels you want to join automatically when you\
                    connect to the chat server.',
            'fields': [
                ['Text', {
                    'ref': 'channels',
                    'text': ul
                }]
            ],
            'event': {
                'change': function( event ) {
                },
                'save': function( event ) {
                },
                'close': function( event ) {
                    client.config_save();
                }
            }
        });
    
    };
    
    var cmd_autojoin = function( cmd ) {
    
        var args = cmd.args.split(' ');
        
        if( !args )
            return;
        
        var subcmd = args.shift().toLowerCase();
        var meth = function( item ) {};
        var mod = false;
        var chan = client.channel(cmd.ns);
        
        switch( subcmd ) {
        
            case 'add':
                meth = function( item ) {
                    if( client.autojoin.channel.indexOf( item ) == -1 ) {
                        mod = true;
                        client.autojoin.channel.push( item );
                        chan.server_message('Added ' + item + ' to your autojoin.');
                    } else {
                        chan.server_message('Already have ' + item + ' on your autojoin.');
                    }
                };
                break;
            case 'rem':
            case 'remove':
                meth = function( item ) {
                    var ci = client.autojoin.channel.indexOf( item );
                    if( ci != -1 ) {
                        mod = true;
                        client.autojoin.channel.splice( ci, 1 );
                        chan.server_message('Removed ' + item + ' from your autojoin.');
                    } else {
                        chan.server_message(item + ' is not on your autojoin list.');
                    }
                };
                break;
            case 'on':
                chan.server_message('Autojoin on.');
                if( !client.autojoin.on ) {
                    mod = true;
                    client.autojoin.on = true;
                }
                break;
            case 'off':
                chan.server_message('Autojoin off.');
                if( client.autojoin.on ) {
                    mod = true;
                    client.autojoin.on = false;
                }
                break;
        
        }
        
        var item = '';
        
        for( var i in args ) {
        
            if( !args.hasOwnProperty(i) )
                continue;
            item = client.deform_ns(args[i]).toLowerCase();
            meth( item );
        
        }
        
        if( mod )
            client.config_save();
    
    };
    
    init();

};


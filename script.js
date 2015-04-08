$(document).ready(function() {

    var dropzone;
    var fileList = [];
    window.myFiles = fileList;
    var opened = undefined;

    function dragenter(e) {
        e.stopPropagation();
        e.preventDefault();
    }

    function dragover(e) {
        e.stopPropagation();
        e.preventDefault();
    }

    function drop(e) {
        e.stopPropagation();
        e.preventDefault();

        var dt = e.dataTransfer;
        var files = dt.files;

        handleFiles(files);
    }

    var updateFileList = function(fileList) {
        var db = jQuery('.dropbox')
        db.text('');
        var ul = jQuery('<ul id="sortable">');
        ul.appendTo(db);
        for (var i = 0; i < fileList.length; i++) {
            var li = jQuery('<li class="ui-state-default"><span class="ui-icon ui-icon-arrowthick-2-n-s"></span>'+
                fileList[i].name + '<button class="delete">Delete</button></li>');
            li.appendTo(ul);
            li.data('file', fileList[i]);
        }
        $( "#sortable" ).sortable();
        $( "#sortable" ).disableSelection();
        $("#sortable .delete").click(function() {
            var index = fileList.indexOf(jQuery(this).parent().data('file'));
            fileList.splice(index, 1);            
            $(this).parent().remove();
            if (fileList.length == 0) {
                $('.dropbox').append("<p>Drop <i>.java</i> files here!</p>");
            }
        });
    }
    window.updateFileList = updateFileList;

    function handleFiles(files) {
        for (var i = 0; i < files.length; i++) {
            console.log(files[i]);
            if (files[i].size < 500000// Only supports less than 500 KB
                && files[i].name.indexOf('.java') > -1) {

                var reader = new FileReader();
                reader.file = files[i].name;
                reader.onload = function(e) {
                    window.testE = e;
                    var fileObject = {
                        'content': e.target.result,
                        'name': this.file
                    }
                    fileList.push(fileObject);
                    updateFileList(fileList);
                };
                reader.readAsText(files[i]);
            }  
        }
    }

    dropzone = jQuery('.dropbox')[0]; 
    dropzone.addEventListener("dragenter", dragenter, false);
    dropzone.addEventListener("dragover", dragover, false);
    dropzone.addEventListener("drop", drop, false);

    window.myFiles = fileList;

    window.clearList = function() {
        $("#sortable .delete").click();
    }

    var highlightCode = function(code) {
        // Highlight code
        var hl_text = $('[name="hl_text"]').val();
        localStorage.setItem("highlightContains", hl_text);

        hljs.highlightBlock(code);
        $('.hljs-comment, .hljs-javadoc', code).each(function(index, el) {
            if ($(this).text().indexOf(hl_text) > 0) {
                $(this).removeClass();
                $(this).addClass('hljs-hl-comment');
            }
        });
    }

    window.do_generate = function(opened) {
        var files = window.myFiles;
        jQuery('.dropbox ul li').each(function(index, value) {
            file = jQuery(value).data('file');

            var header = opened.document.createElement('h2');
            header.innerText = file.name;
            var code = opened.document.createElement('code');
            code.innerHTML = file.content;

            highlightCode

            var pre = opened.document.createElement('pre');
            pre.appendChild(code);
            jQuery('body', opened.document).append(header);
            jQuery('body', opened.document).append(pre);
        });
    }

    window.generate = function() {
        if (opened === undefined) {
            opened = window.open();
            var site = '<html><head><link rel="stylesheet" href="http://kdo.dk/app/javaSourcePrinter/code_style.css"><script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script><script src="http://cdn.jsdelivr.net/highlight.js/8.5/highlight.min.js"></script></head><body><script>window.fullyLoaded = true;</script></body></html>';
            opened.document.write(site);
            window.opened = opened;
        }

        jQuery(opened.document).ready(function() {
            // Nasty hack because ready() simply doesn't work on popups...
            if (opened.window.fullyLoaded !== true) {
                console.log('Not loaded');
                setTimeout(generate, 20);
            } else {
                do_generate(opened);
                window.opened = undefined;
                opened = undefined;
            }

        });
    }

    $("#option_box").accordion({
        collapsible: true
    });

    $("#option_box").accordion({
        active: false
    });

    $('[name="hl_text"]').val(localStorage.getItem("highlightContains"));

});
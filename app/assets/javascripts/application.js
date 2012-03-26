// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or vendor/assets/javascripts of plugins, if any, can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// the compiled file.
//
// WARNING: THE FIRST BLANK LINE MARKS THE END OF WHAT'S TO BE PROCESSED, ANY BLANK LINE SHOULD
// GO AFTER THE REQUIRES BELOW.
//
//= require jquery
//= require jquery_ujs
//= require_tree .

Pusher.log = function(message) {
	if (window.console && window.console.log) window.console.log(message);
};

var NoticeBoard = {
	
	token: null,
	wSize: {},
	items: [],
	socketId: null,
	maxSize: {
		w: 2000,
		h: 1200
	},
	
	init: function(token){
		this.token = token;
		
		this.w = $(window); 
		this.board = $('#notice-board');
		this.updateWindowSize();
		
		// Create our pusher credentials
		this.pusher = new Pusher('23a8a19850a9e1bb20a8');
		this.channel = this.pusher.subscribe('notice-' + this.token);
		
		// Get all items
		this.getAll();
		this.attach();
	},
	
	attach: function(){
		var self = this;
		
		this.board.css({
			width: this.maxSize.w,
			height: this.maxSize.h
		})
		
		this.w.resize(function(){
			self.updateWindowSize();
		});
		
		this.pusher.connection.bind('connected', function() {
		  self.socketId = self.pusher.connection.socket_id;
		});
		
		this.channel.bind('created', function(data) {
			self.createItem(data);
	    });
	
		this.channel.bind('updated', function(data) {
			self.updateItem(data);
	    });
	
		this.channel.bind('destroyed', function(data) {
			self.deleteItem(data);
	    });
		
		$('.add-new-item').click(function(){
			self.createNew();
			return false;
		});
	},
	
	createNew: function(){
		/*
			Create a new notice board item and add it into a random position on the board
		*/
		var pos_x = 30,
			pos_y = 30,
			item = $('<div class="item"><div class="item-text"></div><a href="#" class="item-handle">+</a></div>'),
			self = this;
			
		item.css({
			top: pos_y + 'px',
			left: pos_x + 'px'
		});
		
		var textA = $('<textarea />');
		item.find('.item-text').html(textA);
		this.board.append(item);
		
		// Bind
		textA.blur(function(){
			var val = $(this).val();
			if(val == ''){
				// Destroy
				item.remove();
			} else {
				$.post(self.token + "/items/", { 
					body: val, 
					pos_x: pos_x, 
					pos_y: pos_y, 
					socket_id: self.socketId
				}, function(data){
					item.attr('data-id', data.id);
					self.items.push(item);
					self.bindItemEvents(item);
				});
				
				// Remove the text area
				textA.remove();
				item.find('.item-text').html(val);
				
				$(this).unbind('blur');
			}
		});
		textA.focus();
		return;
	},
	
	createItem: function(data){
		// Do we have this item already?
		if(this.board.find('.item[data-id="'+ data.id +'"]').length > 0) { 
			console.log('Duplicate item');
			return;
		}
		
		var item = $('<div class="item"><div class="item-text"></div><div href="#" class="item-handle">+</div></div>');
		item.css({
				top: data.pos_y + 'px',
				left: data.pos_x + 'px'
			 })
			.attr('data-id', data.id)
			.find('.item-text').text(data.body);
		
		this.board.append(item);
		this.items.push(item);
		this.bindItemEvents(item);
	},
	
	updateItem: function(data){
		/* Find the item and update with the new data */
		var item = this.board.find('.item[data-id="'+ data.id +'"]');
		item.css({
			left: data.pos_x,
			top: data.pos_y
		})
		.find('.item-text').text(data.body);
	},
	
	deleteItem: function(data){
		// Remove item
		var item = this.board.find('.item[data-id="'+ data.id +'"]');
		item.remove();
	},
	
	bindItemEvents: function(item){
		var self = this;
		
		item.drag(function( ev, dd ){
			$( this ).css({
				top: dd.offsetY,
				left: dd.offsetX
			});
		},{ handle:".item-handle" })
		.drag("end",function(){
			// Update this item
			self.updateItemOnServer(item);				   
		});
		
		item.dblclick(function(e){
			// Add in the text area here
			var textC = item.find('.item-text'),
				textA = $('<textarea />'),
				text = textC.text();
				
			textC.html(textA);
			self.board.append(item);

			// Bind the textarea
			textA.blur(function(){
				var val = $(this).val();
				if(val == ''){
					// Destroy
					self.destroyItemOnServer(item.attr('data-id'));
					item.remove();
				} else {
					// Remove the text area
					textA.remove();
					item.find('.item-text').html(val);
					self.updateItemOnServer(item);
					$(this).unbind('blur');
				}
			});
			textA.val(text).focus();
			return false;
		});
	},
	
	itemToData: function(item){
		return {
			id: item.attr('data-id'),
			socket_id: this.socketId,
			pos_x: item.css('left'),
			pos_y: item.css('top'),
			body: item.find('.item-text').text() 
		}
	},
	
	updateItemOnServer: function(item){
		var self = this;
		$.ajax({
			type: "PUT",
		   	url: self.token + "/items/" + item.attr('data-id'),
		    data: self.itemToData(item),
		    success: function(data){ }
		});
	},
	
	destroyItemOnServer: function(id){
		var self = this;
		$.ajax({
			type: "DELETE",
		   	url: self.token + "/items/" + id,
		    data: { id: id, socket_id: self.socketId },
		    success: function(data){ }
		});
	},
	
	getAll: function(){
		var self = this;
		$.get(this.token + "/items/", function(data){
			if(data.length > 0){
				for(var i = 0; i < data.length; i++){
					var item = data[i];
					self.createItem(item);
				}
			}
		});
	},
	
	updateWindowSize: function(){
		console.log('Update window size');
		this.wSize = {
			x: parseInt( this.w.width() ),
			y: parseInt( this.w.height() )
		}
	}
}


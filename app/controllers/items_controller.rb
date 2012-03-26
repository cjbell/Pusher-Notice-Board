class ItemsController < ApplicationController
  before_filter :get_notice
  
  def index
    render :json => @notice.items
  end  
  
  def create
    item = @notice.items.create!({
      :body => params[:body],
      :pos_x => params[:pos_x],
      :pos_y => params[:pos_y]
    })

    Pusher[@notice.channel_name].trigger('created', item.attributes, params[:socket_id])
    render :json => item
  end
  
  def update
    item = @notice.items.find(params[:id])
    item.update_attributes!({
      :body => params[:body],
      :pos_x => params[:pos_x],
      :pos_y => params[:pos_y]
    })

    Pusher[@notice.channel_name].trigger('updated', item.attributes, params[:socket_id])
    render :json => item
  end
  
  def show
    item = @notice.items.find(params[:id])
    render :json => item
  end
  
  def destroy
    @notice.items.find(params[:id]).destroy
    Pusher[@notice.channel_name].trigger('destroyed', {:id => params[:id]}, params[:socket_id])
    render :json => {}
  end
  
  private
  def get_notice
    @notice = Notice.find_by_token(params[:token])
  end
end

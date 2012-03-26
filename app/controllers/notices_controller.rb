class NoticesController < ApplicationController
  def index
    @notice = Notice.create!
    redirect_to show_notice_path(:token => @notice.token)
  end
  
  def show
    @notice = Notice.find_by_token(params[:token])
    redirect_to :root if @notice.nil?
  end
  
end

PusherCollage::Application.routes.draw do
  root :to => "notices#index"
  get ":token" => "notices#show", :as => :show_notice
  # delete ":token/destroy" => "list#destroy", :as => :destroy_list

  scope ":token", :as => "notice" do
    resources :items, :except => [:new, :edit]
  end
end

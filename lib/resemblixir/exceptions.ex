# defexception BadPngError do
#   defstruct [:file]
#   def message(error) do
#     "Png.decode can only parse .png files. \n \n Received: \n #{error.file}"
#   end
# end

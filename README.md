### Images connected to S3 and amazon EC2

This is a web application that can upload, delete, update and re-size images from s3

For uploading image go to [click her](http://localhost:8000/) in this page you will be able to see all the images that are currently in s3 bucket

For deleting an image from the bucket you should write /delete/:imageName  
Lets say for example you would like to delete the image named "Img" so you should go to the path localhost:8000/delete/Img

For updating an image name you should write /delete/:imageName/:newName  
Lets say for example you would like to update the image named "Img" to "newName" so you should go to the path localhost:8000/update/Img/newName

For resizing an image name you should write /resize/:imageName/  
Lets say for example you would like to resize the image named "Img" so you should go to the path localhost:8000/resize/Img and the new re sized images will be in the resized folder inside the bucket

For printing the details in Mongo/  
[mongo records](localhost:8000/getMongo)

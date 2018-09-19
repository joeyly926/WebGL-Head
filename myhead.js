
/**
 * JS file for creating a head.
 * @author Joseph Ly ID: 15019405X
 */
var gl = null,
	canvas = null,
	glProgram = null,
	fragmentShader = null,
	vertexShader = null;

var vertexPositionAttribute = null,
	vertexNormalAttribute = null,
	trianglesVerticeBuffer = null,
	vertexColorAttribute = null,
	trianglesColorBuffer = null;
	vertexTextureCoordAttribute = null,
	vertexTextureCoordBuffer = null,
	texture = null;

var mvMatrix = mat4.create(),
	pMatrix = mat4.create();

var rotateValue = 0.0;

var meshStr = readTextFile("myhead.obj");
var meshObj = new OBJ.Mesh(meshStr);

function initWebGL()
{
	canvas = document.getElementById("my-canvas");
	gl = canvas.getContext("experimental-webgl");

	if(gl)
	{
		initBuffers();
		initShaders();
		initTexture();
		initMatrixUniforms();
		animLoop();
	}else{
		alert( "Error: Your browser does not appear to" + "support WebGL.");
	}
}

function animLoop()
{
	updateWebGL();
	updateBuffers();
	updateMatrixUniforms();
	drawScene();
	requestAnimationFrame(animLoop, canvas);
}

function initTexture() 
{
    texture = gl.createTexture();
    texture.image = new Image();
    texture.image.src = "myhead.jpg";
    texture.image.onload = function ()
    {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }
}
function updateWebGL()
{
	gl.enable(gl.DEPTH_TEST);

	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);

	//set viewport
	gl.viewport(0, 0, canvas.width, canvas.height);
	//set view and projection matrix
	mat4.perspective(45, canvas.width / canvas.height, 0.1, 100.0, pMatrix);
	mat4.identity(mvMatrix);
	mat4.translate(mvMatrix, [0, 0, -8.0]);
	
	rotateValue += 0.01;
	var rotAxis = new Array(0,1,0);
	mat4.rotate(mvMatrix, rotateValue, rotAxis, null);
}

function initShaders()
{
	//get shader source
	var fs_source = document.getElementById('shader-fs').innerHTML,
	vs_source = document.getElementById('shader-vs').innerHTML;

	//compile shaders
	vertexShader = makeShader(vs_source, gl.VERTEX_SHADER);
	fragmentShader = makeShader(fs_source, gl.FRAGMENT_SHADER);

	//create program
	glProgram = gl.createProgram();

	//attach and link shaders to the program
	gl.attachShader(glProgram, vertexShader);
	gl.attachShader(glProgram, fragmentShader);
	gl.linkProgram(glProgram);
	if (!gl.getProgramParameter(glProgram, gl.LINK_STATUS)) {
		alert("Unable to initialize the shader program.");
	}

	//use program
	gl.useProgram(glProgram);
}

function makeShader(src, type)
{
	//compile the vertex shader
	var shader = gl.createShader(type);
	gl.shaderSource(shader, src);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert("Error compiling shader: " + gl.getShaderInfoLog(shader));
	}
	return shader;
}

function initBuffers()
{
	OBJ.initMeshBuffers( gl, meshObj );
}

function updateBuffers()
{

}

function drawScene()
{
	vertexPositionAttribute = gl.getAttribLocation(glProgram,
		"aVertexPosition");
	gl.enableVertexAttribArray(vertexPositionAttribute);
	gl.bindBuffer(gl.ARRAY_BUFFER, meshObj.vertexBuffer);
	gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
		
	vertexNormalAttribute = gl.getAttribLocation(glProgram, "aVertexNormal");
	gl.enableVertexAttribArray(vertexNormalAttribute);
	gl.bindBuffer(gl.ARRAY_BUFFER, meshObj.normalBuffer);
	gl.vertexAttribPointer(vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);
	
	vertexTextureCoordAttribute = gl.getAttribLocation(glProgram, "aTextureCoord");
	gl.enableVertexAttribArray(vertexTextureCoordAttribute);
    gl.bindBuffer(gl.ARRAY_BUFFER, meshObj.textureBuffer);
    gl.vertexAttribPointer(vertexTextureCoordAttribute, 2, gl.FLOAT, false, 0, 0);
	
	glProgram.samplerUniform = gl.getUniformLocation(glProgram, "uSampler");
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(glProgram.samplerUniform, 0);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, meshObj.indexBuffer);
	gl.drawElements(gl.TRIANGLES, meshObj.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
}

function initMatrixUniforms(){
	glProgram.pMatrixUniform = gl.getUniformLocation(glProgram, "uPMatrix");
	glProgram.mvMatrixUniform = gl.getUniformLocation(glProgram, "uMVMatrix");
	glProgram.nMatrixUniform = gl.getUniformLocation(glProgram, "uNMatrix");
}

function updateMatrixUniforms() {
	gl.uniformMatrix4fv(glProgram.pMatrixUniform, false, pMatrix);
	gl.uniformMatrix4fv(glProgram.mvMatrixUniform, false, mvMatrix);
	
	var normalMatrix = mat3.create();
    mat4.toInverseMat3(mvMatrix, normalMatrix);
    mat3.transpose(normalMatrix);
    gl.uniformMatrix3fv(glProgram.nMatrixUniform, false, normalMatrix);
}

function readTextFile(file)
{
    var xhttp = new XMLHttpRequest();
    var strText;
    xhttp.open("GET", file, false);
    xhttp.onreadystatechange = function (){
        if(xhttp.readyState === 4 && (xhttp.status === 200 
			|| xhttp.status == 0))
			strText = xhttp.responseText;
    }
    xhttp.send(null);
    return strText;
}
	//</script>

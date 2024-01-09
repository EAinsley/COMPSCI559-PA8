const codeSnippets = {
  default: [
    /*glsl*/ `#version 300 es
precision highp float;
in vec4 a_position;
in vec3 a_normal;
uniform mat4 u_cameraMatrix;
uniform mat4 u_worldMatrix;
uniform mat4 u_projectionMatrix;
out vec3 v_normal;
out vec3 v_position;


void main()
{
  v_normal = normalize((a_normal));
  vec4 pos = u_worldMatrix * a_position;
  v_position = pos.xyz;
  gl_Position = u_projectionMatrix * u_cameraMatrix * pos;
}
`,
    /* glsl */ `#version 300 es
precision highp float;
uniform float time;
uniform vec2 resolution;
in vec3 v_position;
in vec3 v_normal;
out vec4 outColor;

void main()
{
  outColor = abs(vec4(v_normal, 1.0));
}`
  ],
  'reflection': [
    /* glsl */ `#version 300 es
precision highp float;
in vec4 a_position;
in vec3 a_normal;

uniform mat4 u_worldMatrix;
uniform mat4 u_cameraMatrix;
uniform mat4 u_projectionMatrix;

out vec3 v_cameraPosition;
out vec3 v_worldNormal;
 
void main() {
  // Multiply the position by the matrix.
  vec4 pos = u_cameraMatrix * u_worldMatrix * a_position;
  v_cameraPosition = pos.xyz;
  v_worldNormal = mat3(u_worldMatrix) * a_normal;
  gl_Position = u_projectionMatrix  * pos;
}`,
    /* glsl */ `#version 300 es
precision highp float;
 
// Passed in from the vertex shader.
in vec3 v_cameraPosition;
in vec3 v_worldNormal;
 
// The texture.
uniform sampler2D u_texture;
uniform samplerCube u_skybox;
uniform vec3 u_worldCameraPosition;
 
out vec4 outColor;
 
void main() {
  vec3 worldNormal = normalize(v_worldNormal);
  vec3 eyeDir = normalize(v_cameraPosition);
  vec3 direction = reflect(eyeDir, worldNormal);
  outColor = texture(u_skybox, direction);
}`,
  ],

  'texture': [
    /* glsl */ `#version 300 es
precision highp float;
in vec4 a_position;
in vec2 a_texcoord;
uniform mat4 u_cameraMatrix;
uniform mat4 u_worldMatrix;
uniform mat4 u_projectionMatrix;
out vec3 v_position;
out vec2 v_texcoord;
 
void main() {
  // Multiply the position by the matrix.
  vec4 pos = u_worldMatrix * a_position;
  v_position = pos.xyz;
  gl_Position = u_projectionMatrix * u_cameraMatrix * pos;
 
  // Pass the texcoord to the fragment shader.
  v_texcoord = a_texcoord;
}`,
    /* glsl */ `#version 300 es
precision highp float;
 
// Passed in from the vertex shader.
in vec2 v_texcoord;
 
// The texture.
uniform sampler2D u_texture;
 
out vec4 outColor;
 
void main() {
   outColor = texture(u_texture, v_texcoord);
}`,
  ],
  'colorful': [
    /*glsl*/ `#version 300 es
precision highp float;
in vec4 a_position;
in vec3 a_normal;
uniform mat4 u_cameraMatrix;
uniform mat4 u_worldMatrix;
uniform mat4 u_projectionMatrix;
out vec3 v_normal;
out vec3 v_position;


void main()
{
  v_normal = normalize((a_normal));
  vec4 pos = u_worldMatrix * a_position;
  v_position = pos.xyz;
  gl_Position = u_projectionMatrix * u_cameraMatrix * pos;
}
`,
    /* glsl */ `#version 300 es
precision highp float;
uniform float time;
uniform vec2 resolution;
in vec3 v_position;
in vec3 v_normal;
out vec4 outColor;

void main()
{
  outColor = abs(vec4(v_normal, 1.0));
}`
  ],
  'transparent': [
    /* glsl*/ `#version 300 es
precision highp float;
in vec4 a_position;
in vec3 a_normal;
// uniform mat3 normalMatrix;
uniform mat4 u_cameraMatrix;
uniform mat4 u_worldMatrix;
uniform mat4 u_projectionMatrix;
out vec3 v_normal;
out vec3 v_position;
out vec4 v_viewPosition;
out float speed;
out float threadshold;


float mrandom (vec2 st) {
  // Random function borrowed here:
  // https://thebookofshaders.com/10/
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}

void main()
{
  speed = 10.0;
  v_normal = normalize(u_cameraMatrix * vec4(a_normal, 1.0)).xyz;
  threadshold = a_position.y + mrandom(a_position.xy) * 0.4;

  vec4 pos = u_worldMatrix * a_position;
  v_position = pos.xyz;
  v_viewPosition = u_projectionMatrix * u_cameraMatrix * pos;
  gl_Position = u_projectionMatrix * u_cameraMatrix * pos;

}
`,
    /* glsl */ ` #version 300 es
  precision highp float;
  uniform float time;
  uniform samplerCube u_skybox;
  in vec3 v_position;
  in vec4 v_viewPosition;
  in vec3 v_normal;
  in float threadshold;

  out vec4 outColor;

  struct LightSource {
    vec3 light_color;
    vec3 light_direction;
    bool on;
  };

  struct PreBlendingLight {
    vec4 AmbientLight;
    vec4 DiffuseLight;
    vec4 SpecularLight;
    float sil;
  };


  const vec3 object_color = vec3(0.22, 0.412, 0.643);


  //                              \\
  // /--------------------------\ \\
  // |                          | \\
  // |   Configurations BELOW   | \\
  // |                          | \\
  // \--------------------------/ \\
  //                              \\

  // /----------\
  // | Dissolve |
  // \----------/
  // Turn-on or Turn-off the dissolve effect.
  const bool dissolveOn = false;
  const float dissolveSpeed = 10.0;
  // The color of the dissove edge

  // Try another color
  // vec3 dissolve_start_color =vec3(1.,1.0, 0.);// Start with blue
  // vec3 dissolve_end_color = vec3(0.733,0.165,0.145); // End with red


  vec3 dissolve_start_color = vec3(0.98, 0.839, 0.7);   // Start with blue
  vec3 dissolve_end_color = vec3(0.616, 0.435, 0.565);  // End with red

  // /------------------\
  // | Translucent body |
  // \------------------/
  // Translucent material
  // I cannot write blending, so this is the best I can do
  const bool translucentBodyOn = true;
  const float waxiness = 0.0;
  const bool backgroundOn = true;

  // /---------------------\
  // | Translucent Surface |
  // \---------------------/
  // Translucent material
  const bool translucentSurfaceOn = true;
  const float sharpness = 36.;

  // /----------\
  // | Specular |
  // \----------/
  // Specular material
  const bool specularOn = true;
  const float specularFactor = 0.9;
  const float shininess = 72.;

  // /---------\
  // | Diffuse |
  // \---------/
  // Specular material
  const bool diffuseOn = true;
  const float diffuseFactor = 0.4;

  // /---------\
  // | Ambient |
  // \---------/
  // Specular material
  const float ambientFactor = 0.2 / 7.;



  vec3 DiffuseColor(vec3 N, vec3 L, vec3 light_color) {
    // https://en.wikibooks.org/wiki/GLSL_Programming/Unity/Diffuse_Reflection
    // I_diffuse = I_incoming * K_diffuse * max(0, N . L)
    float diffuse = diffuseFactor * max(0.0, dot(N, L));
    return diffuse * (object_color * light_color);
  }


  vec3 AmbientColor(vec3 light_color) {
    // https://en.wikibooks.org/wiki/Cg_Programming/Unity/Specular_Highlights
    // This seems to be calculate by some global lighting algorithms (in Unity),
    // but I haven't figure it out.

    return ambientFactor * light_color * object_color;
  }

  vec3 SpecularColor(vec3 V, vec3 R, vec3 light_color) {
    // I_s = I_i * K_s * max(0, R . V)^shiness
    // https://en.wikibooks.org/wiki/Cg_Programming/Unity/Specular_Highlights
    // The code provided on class seems not entirely the specular highlight.
    // Maybe it also considered diffusion & ambient. I haven't figure it out.
    vec3 specular_color = vec3(1.0, 1.0, 1.0);
    return specularFactor * light_color * specular_color *
        pow(max(0.0, dot(R, V)), shininess);
  }

  vec3 DiffuseTranslucency(vec3 L, vec3 N, vec3 light_color) {
    // https://en.wikibooks.org/wiki/GLSL_Programming/Unity/Translucent_Surfaces
    // I_dt = I_incoming * K_dt * max(0, L . -N)
    //  vec3 diffuse_translucency_color = vec3(1,1,1);
    vec3 diffuse_translucency_color = 0.25 * vec3(0.2, 0.4, 0.8);
    return diffuse_translucency_color * light_color * max(0.0, dot(L, -N));
  }

  vec3 ForwardTranslucency(vec3 L, vec3 N, vec3 light_color) {
    // https://en.wikibooks.org/wiki/GLSL_Programming/Unity/Translucent_Surfaces
    // I_dt = I_incoming * K_dt * max(0, L . -N)^n_sharpness
    vec3 forward_translucency_color = 0.25 * vec3(0.2, 0.4, 0.8);
    //  vec3 forward_translucency_color = 0.25 * object_color;
    return forward_translucency_color * light_color *
        pow(max(0.0, dot(L, (-N))), sharpness);
  }

  float Silhouetteness(vec3 V, vec3 N) {
    // https://en.wikibooks.org/wiki/Cg_Programming/Unity/Translucent_Bodies
    // 1 - |N路L|

    return min(1.0, 0.0 + 1.0 - abs(dot(V, N)));
  }

  vec3 Waxiness(vec3 L, vec3 N, vec3 light_color) {
    // https://en.wikibooks.org/wiki/Cg_Programming/Unity/Translucent_Bodies
    //  I_diffuse = I_incoming * K_diffuse *(w + (1-w)max(0, N . L)

    //  vec3 forward_translucency_color = 0.25 * object_color;
    return diffuseFactor * light_color * object_color *
        (waxiness + (1. - waxiness) * max(0.0, dot(L, N)));
  }

  vec4 Background() {
    vec3 distortedPosition = -(v_viewPosition.xyz + v_normal);
    distortedPosition.y = -distortedPosition.y;
    return texture(u_skybox, normalize(distortedPosition));
  
  }

  vec4 LightColor(LightSource light) {
    if (!light.on) return vec4(0.0, 0.0, 0.0, 0.);

    // Initialization
    vec3 L = normalize(light.light_direction);
    vec3 N = normalize(v_normal);
    vec3 V = normalize(-v_position);
    vec3 R = normalize(reflect(-L, N));
    vec3 color = light.light_color;
    vec3 translucent_surface = vec3(0.0);
    vec3 diffuse_color = vec3(0.0);
    vec3 specular_color = vec3(0.0);
    vec3 ambient_color = AmbientColor(color);
    float sil = 1.0;
    if (diffuseOn && !translucentBodyOn) {
      diffuse_color = DiffuseColor(N, L, color);
    }
    if (translucentBodyOn) {
      diffuse_color = Waxiness(N, L, color);
    }
    if (translucentSurfaceOn) {
      translucent_surface +=
          DiffuseTranslucency(L, N, color) + ForwardTranslucency(L, N, color);
    }
    if (specularOn) {
      specular_color = SpecularColor(V, R, color);
    }
    //  if(translucentBodyOn && N.z < 0.) {
    //    rescolor = vec3(0.0, 0.0,0.0);
    //  }
    if (translucentBodyOn) {
      sil = Silhouetteness(normalize(-v_position), normalize(v_normal));
    }
    // On the back

    return vec4(
        ambient_color + translucent_surface + diffuse_color + specular_color,
        sil);
  }

  vec4 AlphaBlend(vec4 a, vec4 b) {
    // https://en.wikipedia.org/wiki/Alpha_compositing
    // alpha_o = alpha_a + alpha_b(1-alpha_a);
    // C_o = (C_a * alpha_a + C_b * alpha_b(1-alpha_a)/alpha_o

    float alphaO = a.a + b.a * (1.0 - a.a);
    vec3 CO = (a.xyz * a.a + b.xyz * b.a * (1.0 - a.a)) / alphaO;
    return vec4(CO, alphaO);
  }

  void main() {
    // Add a new Light source?
    // First define "LightSource <light_name> = LightSource(<light_color>,
    // <light_direction>, true)" Then append "+ LightColor(<light_name>)" to the
    // color line (first line in main)

    // A moving red light source
    LightSource lightA = LightSource(
        vec3(0.4, 0.4, 0.4),
        vec3(0.3, sin(time * 20.0) * 2.0, cos(time * 20.0)) * 2.0, true);
    // A moving green light source
    LightSource lightE = LightSource(
        vec3(0., 1., .0),
        vec3(sin(time * 20.0) * 2.0, 0.3, cos(time * 20.0)) * 2.0, false);
    // A moving blue light source
    LightSource lightF = LightSource(
        vec3(0., 0., .1),
        vec3(cos(time * 20.0) * 2.0, sin(time * 20.0) * 2.0, 0.3), false);
    // A stationary light source on the back.
    LightSource lightB =
        LightSource(vec3(0.0, 0.671, 0.8), vec3(0, 0., -1.0), true);
    // A stationary light source on the front-left-bottom corner
    LightSource lightC =
        LightSource(vec3(0.8, 0.671, 0.0), vec3(-1.0, -1.0, 1.0), true);
    // A stationary light source on the back-right-bottom corner
    LightSource lightD =
        LightSource(vec3(0.714, 0.0, 0.808), vec3(1.0, -1.0, 1.0), true);
    // Stationary white light
    LightSource lightG =
        LightSource(vec3(1., 1.0, 1.0), vec3(0., 1., 0.), false);


    // LightModel lightA = LightModel(vec3(1.,1.,1.0),  vec3(sin(time * 20.0)
    // * 1.0,1.0,cos(time * 10.0))); LightModel lightB =
    // LightModel(vec3(1.,0.,0.), vec3(0,1.,1.0));

    vec4 color = LightColor(lightA) + LightColor(lightB) + LightColor(lightC) +
        LightColor(lightD) + LightColor(lightF) + LightColor(lightG);
    if (translucentBodyOn && backgroundOn) {
      color = AlphaBlend(color, Background());
    }


    // LightColor(lightA) + LightColor(lightB) + LightColor(lightC) +
    // LightColor(lightD) + LightColor(lightE) + LightColor(lightF)  /*new color
    // add here*/;

    if (dissolveOn) {
      float t = threadshold - sin(time * dissolveSpeed) * 1.3 - 0.05;
      if (t > 0.05)
        discard;
      else if (t > -0.05)
        color = vec4(
            mix(dissolve_start_color, dissolve_end_color, (t + 0.05) * 20.),
            1.0);
    }

    outColor = color;
  }
`,
  ],
  'discard': [
    `#version 300 es
precision highp float;
in vec4 a_position;
in vec3 a_normal;
uniform mat4 u_cameraMatrix;
uniform mat4 u_worldMatrix;
uniform mat4 u_projectionMatrix;
out vec3 v_normal;
out vec3 v_position;


void main()
{
  v_normal = normalize((u_worldMatrix * vec4(a_normal, 1.0))).xyz;
  vec4 pos = u_worldMatrix * a_position;
  v_position = pos.xyz;
  gl_Position = u_projectionMatrix * u_cameraMatrix * pos;
}
`,
    /*glsl*/ `#version 300 es
precision highp float;
uniform float time;
uniform vec2 resolution;
in vec3 v_position;
in vec3 v_normal;
out vec4 outColor;

void main()
{
  if(v_normal.x < 0.0) discard;
  
  // Color according to placement in *object* space
  outColor = abs(vec4(normalize(v_normal * v_position), 1.0));

}`
  ],

  'specular': [
    `#version 300 es
precision highp float;
in vec4 a_position;
in vec3 a_normal;
uniform mat4 u_cameraMatrix;
uniform mat4 u_worldMatrix;
uniform mat4 u_projectionMatrix;
out vec3 v_normal;
out vec3 v_position;


void main()
{
  vec4 target = a_position + vec4(a_normal, 0.0);
  target = u_worldMatrix * target;
  vec4 pos = u_worldMatrix * a_position;
  v_normal = normalize(target - pos).xyz;
  v_position = (u_cameraMatrix * pos).xyz;
  gl_Position = u_projectionMatrix * u_cameraMatrix * pos;
}
`,
    `#version 300 es
precision highp float;
uniform float time;
uniform vec2 resolution;
in vec3 v_position;
in vec3 v_normal;
out vec4 outColor;

const float ambient_coeff   = 0.25;
const float specular_coeff  = 1.0;
const float specular_exp    = 8.0;
const vec3  light_direction = vec3(.0,1.0,-1.0); // stationary light
const vec3  light_color     = vec3(1.0,1.0,1.0);
const vec3  object_color    = vec3(0.1,0.5,0.9); // greay

void main()
{
  vec3 l = normalize(light_direction);
  vec3 n = normalize(v_normal);
  vec3 e = normalize(-v_position);
  vec3 h = normalize (e+l);

  vec3 ambient_color  = ambient_coeff  * object_color;
  vec3 specular_color = specular_coeff * pow(max(0.0,dot(n,h)),specular_exp) * light_color;

  outColor = vec4(ambient_color+specular_color, 1.0);
}`
  ],

};

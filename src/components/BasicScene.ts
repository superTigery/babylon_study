import {
  AbstractMesh,
  ArcRotateCamera,
  Axis,
  Color3,
  Color4,
  Constants,
  CubeTexture,
  Engine,
  GlowLayer,
  HDRCubeTexture,
  HemisphericLight,
  Mesh,
  MeshBuilder,
  MirrorTexture,
  PBRMaterial,
  Plane,
  Quaternion,
  Scene,
  SceneLoader,
  StandardMaterial,
  Texture,
  Tools,
  Vector2,
  Vector3,
} from '@babylonjs/core'
import { AdvancedDynamicTexture, Button, Ellipse, Rectangle, StackPanel, TextBlock } from '@babylonjs/gui'

import '@babylonjs/loaders'

import { ConfigType } from '../types/index'

/**
 * 模型枚举
 * 说明：
 * public 文件下的models文件夹下对应的两个模型名称
 */
const enum MODEL_MAP {
  PERFUME_MODEL = 'perfume.glb',
  MACHINE_MODEL = 'machine.gltf',
  PHONE_MODEL = 'shouji.glb',
  PING_BAN_MODEL = 'pingban.glb',
  GUAN_TI_LIAO = 'guantiliao.glb',
  // BOOM_BOX_MODEL = 'BoomBox.gltf',
  // DAMAGED_HELEMET_MODEL = 'DamagedHelmet.gltf',
}

/**
 * 说明：
 * env/environmentSpecular.env：
 * env:表示 public下的env文件夹
 * environmentSpecular.env: 表示env文件夹下environmentSpecular.env文件
 */
const enum ENV_MAP {
  DEFAULT_ENV = 'env/environmentSpecular.env',
}

class BasicScene {
  public engine: Engine
  public scene: Scene
  public camera: ArcRotateCamera
  public model: AbstractMesh | null = null
  public sphere: Mesh | null = null
  public config: ConfigType
  public advancedTexture: AdvancedDynamicTexture

  constructor(canvas: HTMLCanvasElement, config: ConfigType) {
    this.config = config
    const { engine, scene, camera } = this.CreateScene(canvas)
    this.engine = engine
    this.scene = scene
    this.camera = camera
    this.advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI('ui')

    SceneLoader.ImportMeshAsync('', 'models/', 'earth-opt.glb').then(() => {
      // 方法一
      const atmosphere = scene.getMeshByName('Earth_Atmosphere')!
      atmosphere.material!.backFaceCulling = false
      // out lighter
      const hightlight = scene.getMeshByName('Earth_Hightlight')!
      hightlight.setParent(atmosphere)
      hightlight.material!.backFaceCulling = false
      atmosphere.billboardMode = Mesh.BILLBOARDMODE_ALL
      const rotationZ = Quaternion.RotationAxis(Axis.Z, Tools.ToRadians(-45))
      atmosphere.rotationQuaternion = atmosphere.rotationQuaternion!.clone().multiply(rotationZ)

      // 方法二
      // const atmosphere = scene.getMeshByName('Earth_Atmosphere')!
      // atmosphere.material!.backFaceCulling = false
      // atmosphere.billboardMode = Mesh.BILLBOARDMODE_ALL

      // const hightlight = scene.getMeshByName('Earth_Hightlight')! as Mesh
      // hightlight.material!.backFaceCulling = false
      // hightlight.bakeCurrentTransformIntoVertices()
      // hightlight.billboardMode = Mesh.BILLBOARDMODE_ALL

      // hightlight.rotationQuaternion = null
      // hightlight.rotation.z = Tools.ToRadians(180)
    })

    this.CreateCirle()

    /**
     * 创建环境灯 可删除
     *
     */
    this.CreateLights()

    /**
     * 创建天空盒 可删除
     */
    // this.CreateSkybox()

    /**
     * 创建env环境 不可删除
     */
    this.CreateEnv()

    /**
     * 创建球体 可删除
     */
    // this.CreateMesh()

    /**
     * 创建辉光层 可删除
     * 需要设置emissiveColor才能生效
     */
    this.CreateGLLayer()

    /**
     * 引入模型 不可删除
     * @param  模型路径及模型名称
     */
    this.ImportModel()

    /**
     * 循环渲染 不可删除
     */
    this.InitialRender()

    /**
     * 窗口自适应 不可删除
     */
    this.OnResize()
  }

  CreateScene(canvas: HTMLCanvasElement) {
    // 创建渲染引擎
    const engine = new Engine(canvas, true)
    /**
     * 超级采样
     * 抗锯齿效果好，但是相对性能消耗较高
     */
    engine.setHardwareScalingLevel(0.5)
    // 创建场景
    const scene = new Scene(engine)
    /**
     * 注意：
     * 设置场景背景颜色后 env会被场景颜色覆盖
     */
    scene.clearColor = new Color4(0, 0, 0, 0)

    // 也可以用下面方式创建默认场景
    // scene.createDefaultEnvironment({
    //   createSkybox: true,
    //   // enableGroundMirror: true,
    // })
    // 创建相机
    const camera = new ArcRotateCamera('Camera', -Math.PI / 2, Math.PI / 2.5, 80, Vector3.Zero(), scene)
    // camera.targetScreenOffset = new Vector2(-0.5, 0)
    // 设置相机目标
    camera.setTarget(Vector3.Zero())
    // 控制器
    camera.attachControl(canvas, true)
    // 禁止鼠标右键
    camera.panningAxis = Vector3.Zero()
    // 相机最近距离
    camera.minZ = 0.5
    // 相机beta最大限制
    // camera.upperBetaLimit = Math.PI / 2
    // // 设置相机半径 滚轮滑动距离
    // camera.upperRadiusLimit = 100
    // camera.lowerRadiusLimit = 10
    // camera.wheelPrecision = 50
    // 设置相机自动旋转
    // camera.useAutoRotationBehavior = true

    return {
      engine,
      scene,
      camera,
    }
  }
  CreateLights() {
    // 创建环境光
    const light = new HemisphericLight('light', new Vector3(5, 10, 0))
    // 设置强度
    light.intensity = 1
    return light
  }
  // 创建辉光层
  CreateGLLayer() {
    const gl = new GlowLayer('gl')
    // 辉光强度
    gl.intensity = 0.8
  }

  CreateMesh() {
    const sphere = MeshBuilder.CreateSphere('sphere', { segments: 20, diameter: 1 })
    sphere.position = new Vector3(-10, 2, 21)
    const material = new StandardMaterial('mat')
    // 辉光颜色
    material.emissiveColor = Color3.White()
    sphere.material = material
    this.sphere = sphere
    return sphere
  }

  CreateCirle() {
    // 大圈

    const bigCircle = MeshBuilder.CreatePlane('big', { size: 40 })
    bigCircle.position = new Vector3(0, -20, 0)
    bigCircle.rotation.x = Tools.ToRadians(90)
    const bigMat = new StandardMaterial('bigMat')
    const bigTex = new Texture('textures/rotationBorder1.png')
    bigMat.diffuseTexture = bigTex
    bigMat.useAlphaFromDiffuseTexture = true
    bigTex.hasAlpha = true
    // bigMat.diffuseTexture.hasAlpha = true
    bigMat.backFaceCulling = true
    bigMat.diffuseColor = Color3.FromHexString('#011c39')
    bigCircle.material = bigMat

    const plane = MeshBuilder.CreatePlane('plane', { size: 30 }, this.scene)
    const texture = new Texture('textures/gaoguang1.png')
    const material = new StandardMaterial('mat', this.scene)
    material.backFaceCulling = false
    material.diffuseTexture = texture
    texture.hasAlpha = true
    material.useAlphaFromDiffuseTexture = true
    plane.rotation.x = Math.PI / 2
    plane.position.y = -1.1
    plane.material = material

    // 小圈
    // const smallCircle = bigCircle.clone('small')
    // smallCircle.scaling = smallCircle.scaling.scaleInPlace(0.8)
    // const smallMat = bigMat.clone('smallMat')
    // const samllTex = new Texture('textures/rotationBorder2.png')
    // smallMat.useAlphaFromDiffuseTexture = true
    // smallMat.diffuseTexture = samllTex
    // smallMat.diffuseTexture.hasAlpha = true
    // smallMat.diffuseColor = Color3.White()
    // smallCircle.material = smallMat

    // this.scene.onBeforeRenderObservable.add(() => {
    //   bigCircle.rotation.z -= 0.01

    //   smallCircle.rotation.z += 0.005
    // })
  }

  /**
   * 加载模型
   */
  async ImportModel() {
    // 获取配置文件中的路径
    const modelPath = this.config.model_path
    const modelName = this.config.model_name

    const result = await SceneLoader.ImportMeshAsync('', `${modelPath}/`, modelName, this.scene)
    // 获取加载后的模型
    this.model = result.meshes[0]
    // 设置模型位置
    this.model.position.y = 0.01
    // 让相机对准模型
    this.camera.target = this.model.position
    // 四元数置为空才能设置旋转
    this.model.rotationQuaternion = null

    this.scene.meshes.forEach((mesh) => {
      const mat = mesh.material
      if (mat && mat instanceof PBRMaterial) {
        // 在PBR着色器中启用镜面反锯齿
        mat.enableSpecularAntiAliasing = true
      }
    })

    // 根据不同模型处理
    if (modelName === MODEL_MAP.PERFUME_MODEL) {
      // 香水模型放大
      this.model.scaling = this.model.scaling.scaleInPlace(32)
      // 设置旋转角度
      this.model.rotation.y = Tools.ToRadians(18)
    } else if (modelName === MODEL_MAP.MACHINE_MODEL) {
      this.model.rotation.y = Tools.ToRadians(-90)
      const mesh = this.scene.getMeshByName('node_GK_DB02_-56386')
      if (mesh) {
        const rect1 = new Rectangle()
        rect1.width = '300px'
        rect1.height = '200px'

        const button = new Button()
        button.width = '50px'
        button.height = '50px'
        button.cornerRadius = 20

        rect1.addControl(button)
        button.onPointerClickObservable.add(() => {
          alert('click')
        })

        const hotArea = new Ellipse()
        hotArea.width = '20px'
        hotArea.height = '20px'
        hotArea.background = 'red'
        hotArea.linkOffsetY = -20

        rect1.addControl(hotArea)

        const text = new TextBlock()
        text.text = '点击查看信息'
        text.color = 'white'
        text.fontSize = '26'
        rect1.addControl(text)

        const left = '80px'
        const top = 0
        button.left = left
        button.top = top
        this.advancedTexture.addControl(rect1)
        rect1.linkOffsetY = -100
        rect1.linkWithMesh(mesh)
      }
    } else if (modelName === MODEL_MAP.PHONE_MODEL) {
      this.model.position.y = -5
      this.model.scaling = this.model.scaling.clone().multiply(new Vector3(190, 190, 190))
    } else if (modelName === MODEL_MAP.PING_BAN_MODEL) {
      this.model.position.y = -5
      this.model.scaling = this.model.scaling.scaleInPlace(130)
    } else if (modelName === MODEL_MAP.GUAN_TI_LIAO) {
      this.model.position.y = -5
      this.model.scaling = this.model.scaling.scaleInPlace(180)
    }

    /**
     * 创建镜面 可注释
     * @param 场景中的模型
     */
    // this.CreateMirror(result.meshes)
  }

  CreateMirror(mesh: any) {
    // 设置镜面
    const mirrorTexture = new MirrorTexture('mirror', { ratio: 1.0 })
    mirrorTexture.mirrorPlane = new Plane(0, -1, 0, 0)

    // 设置地面
    const ground = MeshBuilder.CreateGround('ground', { height: 150, width: 150, subdivisions: 4 })
    const groundMaterial = new PBRMaterial('groundMaterial')
    // 镜面颜色
    groundMaterial.albedoColor = Color3.Black()
    groundMaterial.metallic = 0.9
    groundMaterial.roughness = 0.3
    groundMaterial.reflectionTexture = mirrorTexture

    // 将模型添加到镜面中
    mesh.forEach((eachMesh: Mesh) => {
      mirrorTexture.renderList!.push(eachMesh)
    })

    // 将球添加到镜面中
    mirrorTexture.renderList!.push(this.sphere!)

    ground.material = groundMaterial
  }

  // 创建天空盒
  CreateSkybox() {
    const skybox = MeshBuilder.CreateBox('skybox', { size: 150 })
    const skyboxMaterial = new StandardMaterial('skybox')
    skyboxMaterial.backFaceCulling = false
    // 天空盒
    //skyboxMaterial.reflectionTexture = new CubeTexture('https://playground.babylonjs.com/textures/skybox', this.scene)
    skyboxMaterial.reflectionTexture = new HDRCubeTexture('env/metro_noord_1k.hdr', this.scene, 150)
    skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE
    skyboxMaterial.diffuseColor = new Color3(0, 0, 0)
    skyboxMaterial.specularColor = new Color3(0, 0, 0)
    skybox.material = skyboxMaterial
  }

  // 创建env
  CreateEnv() {
    // 获取配置文件中的HDR路径
    const envPath = this.config.env_path
    const envName = this.config.env_name

    const env = CubeTexture.CreateFromPrefilteredData(`${envPath}/${envName}`, this.scene)
    /**
     * 设置env
     * 该行效果会被scene.clearColor设置的颜色覆盖
     */
    this.scene.environmentTexture = env

    /**
     * 设置天空盒
     * 和this.scene.environmentTexture = env 互斥
     */
    // this.scene.createDefaultSkybox(env, true, 1000, 0.5)
  }

  InitialRender() {
    this.engine.runRenderLoop(() => {
      this.scene.render()
    })
  }

  OnResize() {
    const resize = () => {
      this.scene.getEngine().resize()
    }

    if (window) {
      window.addEventListener('resize', resize)
    }
  }
}

export { BasicScene }

module Type where

import Data.Map as M
import Data.Array as A
import Control.Lens hiding (Context,Empty)
import Control.Monad
import Control.Monad.Trans.State

newtype Name = Name String

data Kind = KStar | KArr Kind Kind
data Data = Inductive [Name] [(Scheme,[Type])] | Coinductive [Name] [(Scheme,[Type])]
data Type = Primitive Name | Variable Name | App Type Type -- Contains Any Kinds
newtype Star = Star Type -- forces *
newtype Arr = Arr Type   -- forces * -> *
data Constraint = Constraint Name [Type]
data Instacnce = Instance [Constraint] Constraint
data Scheme = Scheme [Name] [Constraint]
data Func = Func Scheme [(String,Star)] [(String,Star)]
-- Name -> Data, Primitive, Constraint, Func
data Environment = Env (Map String Data) (Map String Constraint) (Map String Func)

data Dir = DirLU | DirU | DirRU | DirR | DirRD | DirD | DirLD | DirL deriving (Eq,Ord)
data Wire = FlowIn (String,Star) | FlowOut (String,Star) | SheathIn Arr | SheathOut Arr | None
data Button = Button Name (Map Dir Wire) | Empty
type Point = (Int,Int)
type Field = Array Point Button
data Context = Context {
  _logs :: [(Point,String)],
  _env :: Environment,
  _field :: Field
}
makeLenses ''Context
makePrisms ''Button

logging :: Point -> String -> World ()
logging p s = logs %= ((p,s):)

inPoint :: Point -> World Bool
inPoint p = do
  f <- use field
  return $ inRange (bounds f) p

enlargeField :: Point -> World ()
enlargeField p = do
  undefined

type World = State Context

initWorld :: Context
initWorld = Context [] (Env d c f) a where
  d = M.empty
  c = M.empty
  f = M.empty
  a = A.array ((0,0),(0,0)) [((0,0),Empty)]

placeButton :: Point -> Name -> World ()
placeButton p n = do
  enlargeField p
  field.ix p .= Button n M.empty

removeButton :: Point -> World ()
removeButton p = do
  field.ix p .= Empty

placeWire :: Point -> Dir -> Wire -> World ()
placeWire p d w = do
  field.ix p._Button._2.ix d .= w

wireValidate :: Point -> World Bool
wireValidate p = do
  logs .= []
  r1 <- connectionCheck p
  r2 <- contextCheck p
  return $ r1 && r2

connectionCheck :: Point -> World Bool
connectionCheck p = undefined

contextCheck :: Point -> World Bool
contextCheck p = undefined

typeValidate :: World Bool
typeValidate = undefined